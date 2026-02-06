* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.container {
    background: rgba(255, 255, 255, 0.95);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
}

h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
    font-size: 36px;
}

.search-box {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
}

#cityInput {
    flex: 1;
    padding: 15px;
    font-size: 16px;
    border: 2px solid #ddd;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.3s;
}

#cityInput:focus {
    border-color: #667eea;
}

#searchBtn {
    padding: 15px 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

#searchBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

#searchBtn:active {
    transform: translateY(0);
}

.weather-display {
    text-align: center;
    padding: 20px;
}

.instruction {
    color: #999;
    font-size: 18px;
}

.weather-info {
    animation: fadeIn 0.5s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.city-name {
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
    font-weight: bold;
}

.temperature {
    font-size: 64px;
    color: #667eea;
    font-weight: bold;
    margin: 20px 0;
}

.description {
    font-size: 24px;
    color: #666;
    text-transform: capitalize;
    margin-bottom: 20px;
}

.details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 20px;
}

.detail-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 10px;
}

.detail-label {
    font-size: 14px;
    color: #999;
    margin-bottom: 5px;
}

.detail-value {
    font-size: 20px;
    color: #333;
    font-weight: bold;
}

.error {
    color: #e74c3c;
    font-size: 18px;
    padding: 20px;
}

.loading {
    color: #667eea;
    font-size: 18px;
}