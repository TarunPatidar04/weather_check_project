CREATE TABLE IF NOT EXISTS cities(
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    created_at TIMESTAMP DEFAULT 
    CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT 
    CURRENT_TIMESTAMP  
);


CREATE TABLE IF NOT EXISTS weather_snapshots(
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    forecast JSONB NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    
      CONSTRAINT fk_city
          FOREIGN KEY (city_id)
          REFERENCES cities(id)
          ON DELETE CASCADE
       
)


CREATE INDEX IF NOT EXISTS idx_weather_city
ON weather_snapshots(city_id)


CREATE INDEX IF NOT EXISTS idx_weather_fetched
ON weather_snapshots(fetched_at DESC)


