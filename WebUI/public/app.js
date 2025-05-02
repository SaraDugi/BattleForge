async function loadPlayers() {
    const response = await fetch('http://localhost:8085/api/player');
    const data = await response.json();
    const list = document.getElementById('players');
    list.innerHTML = '';
    (data.players || []).forEach(player => {
      const item = document.createElement('li');
      item.textContent = `${player.nickname} (${player.score})`;
      list.appendChild(item);
    });
} 