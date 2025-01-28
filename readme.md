# Create .env file in this format:

GEMINI_API_KEY=the_key

# Run this on the terminal

export GOOGLE_APPLICATION_CREDENTIALS=path_to_the_google_json_file

# Running the project

## For Development (No Nginx, Hot Reload)

docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up

## For Production (With Nginx)

Coming Soon

<!-- docker-compose -f docker-compose.prod.yml up --build -d -->
