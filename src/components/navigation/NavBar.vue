<script setup lang="ts">
type Tab = {
    label: string;
    value: string;
    icon: string;
};

type Props = {
    tabs: Tab[];
    selectedTab: string;
    isLoggedIn: boolean;
    isDarkMode: boolean;
};

type Emits = {
    (e: "tab-change", value: string): void;
    (e: "toggle-theme"): void;
    (e: "logout"): void;
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

function onTabClick(value: string) {
    if (value === "logout") {
        emit("logout");
        return;
    }
    if (value === "theme") {
        emit("toggle-theme");
        return;
    }
    emit("tab-change", value);
}
</script>

<template>
    <nav class="nav-container">
        <div class="nav-content">
            <div class="nav-tabs">
                <div
                    v-for="tab in tabs"
                    :key="tab.value"
                    :class="['nav-item', { active: selectedTab === tab.value }]"
                    @click="onTabClick(tab.value)"
                >
                    <div class="icon-wrapper">
                        <span class="icon" v-html="tab.icon"></span>
                    </div>
                    <span class="label">{{ tab.label }}</span>
                </div>
            </div>
            <div class="nav-actions">
                <div class="auth-buttons">
                    <button
                        v-if="isLoggedIn"
                        class="auth-button profile"
                        @click="onTabClick('profile')"
                    >
                        내정보
                    </button>
                    <button
                        v-if="isLoggedIn"
                        class="auth-button logout"
                        @click="onTabClick('logout')"
                    >
                        로그아웃
                    </button>
                    <template v-else>
                        <button class="auth-button login" @click="onTabClick('login')">
                            로그인
                        </button>
                        <button class="auth-button register" @click="onTabClick('register')">
                            회원가입
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.nav-container {
    width: 100%;
    background: var(--box-bg);
    border-bottom: 1px solid var(--border-color);
    padding: 10px 0;
    position: sticky;
    top: 20px;
    z-index: 100;
    transition: all 0.3s ease;
    margin-top: 20px;
}

.nav-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    height: 80px;
    padding: 0 20px;
    position: relative;
}

.nav-tabs {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 40px;
}

.nav-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 24px;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    background-color: var(--box-bg);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    border: 1px solid var(--border-color);
}

.nav-item:hover .icon-wrapper {
    background-color: var(--button-secondary-hover);
    transform: translateY(-2px);
}

.nav-item.active .icon-wrapper {
    background-color: var(--button-primary);
}

.nav-item.active .icon {
    color: white;
}

.icon {
    font-size: 20px;
    line-height: 1;
}

.label {
    font-size: 13px;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-item.active .label {
    color: var(--button-primary);
    font-weight: bold;
}

.theme-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.theme-toggle .icon-wrapper {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--box-bg);
    border: 1px solid var(--border-color);
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.theme-toggle:hover .icon-wrapper {
    transform: translateY(-2px);
    background-color: var(--button-secondary-hover);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.theme-toggle .icon {
    font-size: 24px;
    line-height: 1;
    transition: all 0.3s ease;
}

.theme-toggle .label {
    font-size: 13px;
    color: var(--text-color);
    font-weight: 500;
    transition: all 0.3s ease;
}

.auth-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
}

.auth-button {
    padding: 10px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    min-width: 100px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.auth-button::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition:
        width 0.6s ease,
        height 0.6s ease;
}

.auth-button:hover::before {
    width: 200%;
    height: 200%;
}

.auth-button.login {
    background-color: var(--button-primary);
    color: white;
    box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
}

.auth-button.login:hover {
    background-color: var(--button-primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

.auth-button.register,
.auth-button.profile {
    background-color: var(--button-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-button.register:hover,
.auth-button.profile:hover {
    background-color: var(--button-secondary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.auth-button.logout {
    background-color: var(--button-secondary);
    color: var(--button-primary);
    border: 2px solid var(--button-primary);
    box-shadow: 0 2px 4px rgba(231, 76, 60, 0.1);
}

.auth-button.logout:hover {
    background-color: var(--button-primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(231, 76, 60, 0.2);
}

@media (max-width: 900px) {
    .nav-content {
        flex-direction: column;
        height: auto;
        gap: 8px;
    }
    .nav-tabs {
        position: static;
        transform: none;
        gap: 16px;
        margin-bottom: 8px;
    }
    .nav-actions {
        margin-left: 0;
    }
}
@media (max-width: 600px) {
    .nav-content {
        flex-direction: column;
        height: auto;
        gap: 8px;
    }
    .nav-tabs {
        gap: 10px;
        margin-bottom: 8px;
    }
    .nav-actions {
        margin-left: 0;
    }
}
</style>
