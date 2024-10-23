# Usar a imagem base do Python 3.11 slim
FROM python:3.11-slim

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o arquivo de dependências para o diretório de trabalho
COPY ./requirements.txt /app/requirements.txt

# Instalar as dependências
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copiar o código da aplicação para o diretório de trabalho
COPY ./app /app/app

# Definir variáveis de ambiente para a configuração do banco de dados
ENV DB_USER=root \
    DB_PASSWORD=password \
    DB_HOST=localhost \
    DB_NAME=db_todolist \
    DB_PORT=3306

# Comando para iniciar a aplicação
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
