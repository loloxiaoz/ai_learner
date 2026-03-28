WEB_DIR := web

.PHONY: install dev build start restart deploy clean help

help:
	@echo "Usage:"
	@echo "  make install   安装依赖"
	@echo "  make dev       启动开发服务器（http://localhost:3000）"
	@echo "  make build     生产构建"
	@echo "  make start     启动生产服务器（需先 build）"
	@echo "  make deploy    构建并部署到 Vercel"
	@echo "  make restart   重启开发服务器（杀进程后重新启动）"
	@echo "  make clean     删除构建产物和依赖"

install:
	cd $(WEB_DIR) && npm install

dev:
	@if [ ! -d "$(WEB_DIR)/node_modules" ]; then \
		echo ">>> node_modules 不存在，先安装依赖..."; \
		cd $(WEB_DIR) && npm install; \
	fi
	cd $(WEB_DIR) && npm run dev

build:
	@if [ ! -d "$(WEB_DIR)/node_modules" ]; then \
		echo ">>> node_modules 不存在，先安装依赖..."; \
		cd $(WEB_DIR) && npm install; \
	fi
	cd $(WEB_DIR) && npm run build

start: build
	cd $(WEB_DIR) && npm run start

deploy:
	@if ! command -v vercel &> /dev/null; then \
		echo ">>> 未找到 vercel CLI，正在安装..."; \
		npm install -g vercel; \
	fi
	@if [ ! -d "$(WEB_DIR)/node_modules" ]; then \
		echo ">>> node_modules 不存在，先安装依赖..."; \
		cd $(WEB_DIR) && npm install; \
	fi
	cd $(WEB_DIR) && vercel --prod

restart:
	@echo ">>> 停止占用 3000 端口的进程..."
	@lsof -ti :3000 | xargs kill -9 2>/dev/null || true
	@$(MAKE) dev

clean:
	rm -rf $(WEB_DIR)/node_modules $(WEB_DIR)/.next
