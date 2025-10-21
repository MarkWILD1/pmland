// Meta Conversions API Server Endpoint
// Este archivo debe ser implementado en tu servidor backend

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// Endpoint para recibir eventos del frontend y enviarlos a Meta
app.post('/api/meta-conversions', async (req, res) => {
    try {
        const { pixel_id, event_name, event_data, access_token } = req.body;
        
        // Validar datos requeridos
        if (!pixel_id || !event_name || !access_token) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }
        
        // Obtener IP del cliente
        const client_ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        event_data.user_data.client_ip_address = client_ip;
        
        // Preparar datos para Meta Conversions API
        const metaPayload = {
            data: [{
                event_name: event_name,
                event_time: event_data.event_time,
                event_source_url: event_data.event_source_url,
                action_source: event_data.action_source,
                user_data: event_data.user_data,
                custom_data: event_data.custom_data || {}
            }]
        };
        
        // Enviar a Meta Conversions API
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${pixel_id}/events`,
            metaPayload,
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    access_token: access_token
                }
            }
        );
        
        console.log('Meta Conversions API Response:', response.data);
        res.json({ success: true, response: response.data });
        
    } catch (error) {
        console.error('Meta Conversions API Error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to send event to Meta Conversions API',
            details: error.response?.data || error.message
        });
    }
});

module.exports = app;

// Para usar con Node.js/Express:
// const metaConversions = require('./api/meta-conversions');
// app.use('/api', metaConversions);
