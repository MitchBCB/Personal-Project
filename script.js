document.getElementById('colorButton').addEventListener('click', function() {
    const colors = ['#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.backgroundColor = randomColor;
});