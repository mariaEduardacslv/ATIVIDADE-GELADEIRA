import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const [status, setStatus] = useState("Conectando...");
  const [temperatura, setTemperatura] = useState("--");

  useEffect(() => {
    // 🔥 TROQUE PELO SEU IP DO PC
    const ws = new WebSocket("ws://192.168.1.106:8080");

    ws.onopen = () => {
      setStatus("Conectado à Central de Saúde");
      console.log("WebSocket conectado");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        console.log("📩 RECEBEU:", data);

        if (data.temperatura !== undefined) {
          setTemperatura(data.temperatura);
        }
      } catch (error) {
        console.log("Erro ao ler mensagem:", error);
      }
    };

    ws.onerror = (error) => {
      console.log("Erro WebSocket:", error);
      setStatus("Erro na conexão");
    };

    ws.onclose = () => {
      setStatus("Desconectado");
    };

    return () => ws.close();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Central de Saúde</Text>

      <Text style={styles.status}>{status}</Text>

      <Text style={styles.label}>Geladeira:</Text>
      <Text style={styles.value}>posto_centro_01</Text>

      <Text style={styles.label}>Temperatura:</Text>
      <Text style={styles.temp}>{temperatura}°C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  status: {
    color: "#22c55e",
    marginBottom: 20,
    fontSize: 16,
  },
  label: {
    color: "#94a3b8",
    marginTop: 10,
  },
  value: {
    color: "white",
    fontSize: 18,
  },
  temp: {
    color: "#38bdf8",
    fontSize: 50,
    fontWeight: "bold",
    marginTop: 10,
  },
});