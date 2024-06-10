import { useState } from "react";
import { Box, Container, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";

const API_WEATHER = `https://api.weatherapi.com/v1/current.json?key=${import.meta.env.VITE_API_KEY}&q=`;

export default function App() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    error: false,
    message: "",
  });
  const [weatherData, setWeatherData] = useState(null);
  const [historial, setHistorial] = useState([]);

  const buscarClima = async (cityName) => {
    setLoading(true);
    setError({
      error: false,
      message: "",
    });

    try {
      if (!cityName.trim()) throw { message: "Campo obligatorio" };

      const response = await fetch(`${API_WEATHER}${cityName}`);
      const data = await response.json();

      if (data.error) throw { message: data.error.message };
      console.log(data);

      const weatherInfo = {
        city: data.location.name,
        country: data.location.country,
        temp: data.current.temp_c,
        condition: data.current.condition.icon,
        icon: data.current.condition.icon,
        conditionText: data.current.condition.text,
        date: new Date().toISOString(),
      };

      setWeatherData(weatherInfo);

      setHistorial([...historial, weatherInfo]);

      await guardarBusqueda(weatherInfo);
    } catch (error) {
      console.log(error);
      setError({
        error: true,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const guardarBusqueda = async (data) => {
    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const savedSearch = await response.json();
      console.log("Búsqueda guardada:", savedSearch);
    } catch (error) {
      console.error("Error al guardar búsqueda:", error.message);
    }
  };

  const enviar = async (e) => {
    e.preventDefault();
    await buscarClima(city);
    setCity("");
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 2 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        TP2 App Clima
      </Typography>
      <Box
        sx={{ display: "grid", gap: 2 }}
        component="form"
        autoComplete="off"
        onSubmit={enviar}
      >
        <TextField
          id="city"
          label="Ciudad"
          variant="outlined"
          size="small"
          required
          fullWidth
          value={city}
          onChange={(e) => setCity(e.target.value)}
          error={error.error}
          helperText={error.message}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          loadingIndicator="Cargando..."
        >
          Buscar
        </LoadingButton>
      </Box>

      {weatherData && (
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" component="h2">
            {weatherData.city}, {weatherData.country}
          </Typography>
          <Box
            component="img"
            alt={weatherData.conditionText}
            src={weatherData.icon}
            sx={{ margin: "0 auto" }}
          />
          <Typography variant="h5" component="h3">
            {weatherData.temp} °C
          </Typography>
          <Typography variant="h6" component="h4">
            {weatherData.conditionText}
          </Typography>
        </Box>
      )}
      <Typography textAlign="center" sx={{ mt: 2, fontSize: "10px" }}>
        Powered by:{" "}
        <a href="https://www.weatherapi.com" title="Weather API">
          WeatherAPI.com
        </a>
      </Typography>
    </Container>
  );
}
