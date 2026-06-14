const express = require("express");
const { MongoClient } = require("mongodb");
const WebSocket = require("ws");

const app = express();
app.use(express.json());

// 🔥 MONGO DB LOCAL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
const dbName = "smart_city_health";

let db;

// ===============================
// CONEXÃO MONGODB
// ===============================
async function conectarBanco() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("🍃 MongoDB conectado com sucesso!");
    } catch (erro) {
        console.log("Erro MongoDB:", erro);
    }
}
conectarBanco();


// ===============================
// WEBSOCKET SERVER (PORTA 8080)
// ===============================
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
    console.log("📱 Cliente conectado no WebSocket");
});


// ===============================
// POST - TELEMETRIA (INSOMNIA)
// ===============================
app.post("/api/telemetria", async (req, res) => {

    const { geladeira_id, temperatura } = req.body;

    const agora = new Date();

    const inicioDaHora = new Date(
        agora.getFullYear(),
        agora.getMonth(),
        agora.getDate(),
        agora.getHours()
    );

    try {
        const colecao = db.collection("historico_vacinas");

        await colecao.updateOne(
            {
                geladeira_id,
                data_hora_bucket: inicioDaHora
            },
            {
                $inc: { quantidade_leituras: 1 },
                $push: {
                    leituras: {
                        timestamp: agora,
                        temperatura: parseFloat(temperatura)
                    }
                }
            },
            { upsert: true }
        );

        // ===============================
        // 🔥 ENVIAR PARA O APP EM TEMPO REAL
        // ===============================
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({
                    geladeira_id,
                    temperatura
                }));
            }
        });

        res.status(201).json({
            status: "Sucesso",
            mensagem: "Dado salvo e enviado em tempo real!"
        });

    } catch (erro) {
        console.log(erro);

        res.status(500).json({
            error: "Erro interno no servidor"
        });
    }
});


// ===============================
// GET - HISTÓRICO (MONGODB)
// ===============================
app.get("/api/historico/:geladeira_id", async (req, res) => {

    const { geladeira_id } = req.params;

    try {
        const colecao = db.collection("historico_vacinas");

        const dados = await colecao
            .find({ geladeira_id })
            .sort({ data_hora_bucket: -1 })
            .limit(5)
            .toArray();

        res.json(dados);

    } catch (erro) {
        res.status(500).json({
            error: "Erro ao buscar histórico"
        });
    }
});


// ===============================
// START SERVIDOR
// ===============================
app.listen(3000, () => {
    console.log("🚀 API rodando em http://localhost:3000");
    console.log("⚡ WebSocket rodando em ws://localhost:8080");

});