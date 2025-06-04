#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os
import json
import aiohttp
import argparse
import signal
import threading
import tempfile
import atexit
from fastapi import FastAPI, APIRouter
from fastapi.responses import JSONResponse
import uvicorn

# PID 파일 경로
PID_FILE = os.path.join(tempfile.gettempdir(), "weather_service_pid.txt")

# 전역 변수로 서버 종료 이벤트 생성
server_shutdown_event = threading.Event()

# FastAPI 앱 생성
app = FastAPI(title="날씨 정보 서비스")

# 라우터 생성
router = APIRouter(
    prefix="/weather",
    tags=["weather"],
    responses={404: {"description": "Not found"}},
)

# API 키 (실제 환경에서는 환경 변수 또는 config 파일에서 로드하는 것이 좋음)
API_KEY = "41d95392cf4c477c7b84e52890968ca0"

# PID 파일 생성
def create_pid_file():
    """PID 파일을 생성하여 현재 프로세스의 PID를 저장합니다."""
    try:
        with open(PID_FILE, 'w') as f:
            f.write(str(os.getpid()))
        print(f"PID 파일 생성: {PID_FILE} (PID: {os.getpid()})")
        
        # 프로그램 종료 시 PID 파일 삭제
        atexit.register(remove_pid_file)
    except Exception as e:
        print(f"PID 파일 생성 실패: {str(e)}")

# PID 파일 삭제
def remove_pid_file():
    """PID 파일을 삭제합니다."""
    try:
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)
            print(f"PID 파일 삭제: {PID_FILE}")
    except Exception as e:
        print(f"PID 파일 삭제 실패: {str(e)}")

# 시그널 핸들러 등록
def signal_handler(sig, frame):
    """시그널 핸들러 - 종료 신호 처리"""
    print(f"신호 감지: {sig}, 서버를 종료합니다...")
    server_shutdown_event.set()
    # PID 파일 삭제 (안전을 위해 여기서도 실행)
    remove_pid_file()
    # 강제 종료 (안전한 종료가 되지 않는 경우를 대비)
    sys.exit(0)

# 시그널 핸들러 설정
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

async def fetch_weather(session, city, api_key, lang, units):
    """날씨 API에서 데이터를 비동기적으로 가져옵니다."""
    api_url = (
        f"https://api.openweathermap.org/data/2.5/weather?"
        f"q={city}&"
        f"APPID={api_key}&"
        f"lang={lang}&"
        f"units={units}"
    )
    
    async with session.get(api_url) as response:
        return await response.json()

async def forecast():
    """날씨 정보를 가져옵니다."""
    try:
        # 요청 파라미터 설정
        city = "Seoul"
        lang = "kr"
        units = "metric"  # 섭씨 온도
        
        # 비동기 HTTP 세션 생성 및 날씨 데이터 가져오기
        async with aiohttp.ClientSession() as session:
            result = await fetch_weather(session, city, API_KEY, lang, units)
        
        # 날씨 데이터 추출
        sky = result["weather"][0]["description"]
        temp_celsius = result["main"]["temp"]
        
        # 온도 변환
        def convert_temperature(temp):
            if temp < 0:
                return f"영하 -{int(abs(temp))}(C)"
            else:
                return f"{temp}(C)"
        
        temp = convert_temperature(temp_celsius)
        
        # 결과 반환
        return {
            "sky": sky,
            "temperature": temp,
            "raw_temp": temp_celsius,
            "city": city,
            "humidity": result["main"]["humidity"],
            "wind_speed": result["wind"]["speed"],
            "timestamp": result.get("dt"),
            "icon": result["weather"][0]["icon"],
            "raw_data": result  # 전체 데이터 (디버깅용)
        }
        
    except Exception as e:
        return {"error": f"날씨 정보 조회 중 오류 발생: {str(e)}"}

@router.get("/current")
async def forecast_endpoint():
    """현재 날씨 정보를 반환하는 엔드포인트"""
    weather_data = await forecast()
    
    # 오류 발생 시 오류 응답 구성
    if "error" in weather_data:
        return JSONResponse(
            status_code=500,
            content={
                "type": "error",
                "data": {
                    "message": weather_data["error"]
                }
            }
        )
    
    # 정상 응답
    return JSONResponse(
        content={
            "type": "success",
            "data": {
                "weather": weather_data
            }
        }
    )

# 라우터 등록
app.include_router(router)

# 직접 실행 시 (Electron에서의 사용)
async def main_async():
    """비동기 메인 함수"""
    weather_data = await forecast()
    
    # 결과 구성
    response = {
        "type": "success",
        "data": {
            "weather": weather_data
        }
    }
    
    # 오류 발생 시 오류 응답 구성
    if "error" in weather_data:
        response = {
            "type": "error",
            "data": {
                "message": weather_data["error"]
            }
        }
    
    # 결과 출력 (JSON 형식)
    print(json.dumps(response, ensure_ascii=False))
    sys.stdout.flush()

# Uvicorn 서버를 별도의 스레드에서 실행하는 함수
def run_server(host, port):
    """별도 스레드에서 Uvicorn 서버 실행"""
    config = uvicorn.Config(app, host=host, port=port)
    server = uvicorn.Server(config)
    
    # 서버 시작
    server.run()

def main():
    """메인 함수 - 서브프로세스 실행 모드와 API 서버 모드 구분"""
    # 명령줄 인자 파싱
    parser = argparse.ArgumentParser(description="날씨 정보 서비스")
    parser.add_argument("--server", action="store_true", help="API 서버 모드로 실행")
    parser.add_argument("--port", type=int, default=8000, help="API 서버 포트 (기본값: 8000)")
    args = parser.parse_args()
    
    # 모드에 따라 다른 동작 수행
    if args.server:
        # API 서버 모드로 실행
        port = args.port
        print(f"FastAPI 서버를 포트 {port}에서 시작합니다...")
        print(f"PID: {os.getpid()}")
        
        # PID 파일 생성
        create_pid_file()
        
        # 안전하게 서버 시작 및 종료 처리
        try:
            # 서버 시작
            uvicorn.run(app, host="127.0.0.1", port=port)
        except KeyboardInterrupt:
            print("KeyboardInterrupt로 서버를 종료합니다.")
        finally:
            print("서버 정리 작업 수행 중...")
            remove_pid_file()
    else:
        # 서브프로세스 모드 (기존 방식과 호환)
        import asyncio
        asyncio.run(main_async())

if __name__ == "__main__":
    main() 