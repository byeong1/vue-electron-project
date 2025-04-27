import axios from "axios";

interface OllamaResponse {
    model: string;
    response: string;
    done: boolean;
}

class OllamaService {
    private static instance: OllamaService;
    private baseURL: string;

    private constructor() {
        this.baseURL = "http://localhost:11434/api";
    }

    public static getInstance(): OllamaService {
        if (!OllamaService.instance) {
            OllamaService.instance = new OllamaService();
        }
        return OllamaService.instance;
    }

    public async generateText(prompt: string): Promise<OllamaResponse> {
        try {
            const response = await axios.post<OllamaResponse>(`${this.baseURL}/generate`, {
                model: "gemma3:12b",
                prompt: prompt,
                stream: false,
                format: "json",
            });

            console.log("response.data :", response.data);
            return response.data;
        } catch (error) {
            console.error("Ollama API 요청 실패:", error);
            throw error;
        }
    }
}

export const ollamaService = OllamaService.getInstance();
