// importação de dependência(s)
const express = require('express')
const path = require('path')
const fs = require('fs')
const app = express()


// variáveis globais deste módulo
const PORT = 3000
const db = {}


// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
const jogadoresJson = fs.readFileSync(path.join(__dirname, 'data', 'jogadores.json'))
db.players = JSON.parse(jogadoresJson).players

const jogosPorJogadorJson = fs.readFileSync(path.join(__dirname, 'data', 'jogosPorJogador.json'))
db.jogosPorJogador = JSON.parse(jogosPorJogadorJson)


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get('/', (req, res) => {
  res.render('index', { players: db.players });
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
app.get('/jogador/:numero_identificador/', (req, res) => {
  const steamid = req.params.numero_identificador

  // 1. Dados do jogadores.json
  const player = db.players.find(p => p.steamid === steamid)
  if (!player) return res.status(404).send('Jogador não encontrado')

  // 2. Dados do jogosPorJogador.json
  const playerGamesData = db.jogosPorJogador[steamid]
  const games = playerGamesData ? playerGamesData.games : []
  const totalGames = playerGamesData ? playerGamesData.game_count : 0

  // 3. Campos calculados
  const notPlayedCount = games.filter(g => g.playtime_forever === 0).length
  const sortedGames = [...games].sort((a, b) => b.playtime_forever - a.playtime_forever)

  const top5Games = sortedGames.slice(0, 5).map(g => ({
    name: g.name,
    playtime: Math.round(g.playtime_forever / 60) + 'h',
    logoUrl: `http://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_logo_url}.jpg`
  }))

  const fav = sortedGames[0]
  const favoriteGame = fav ? {
    name: fav.name,
    playtime: Math.round(fav.playtime_forever / 60) + 'h',
    logoUrl: `http://media.steampowered.com/steamcommunity/public/images/apps/${fav.appid}/${fav.img_logo_url}.jpg`,
    statsUrl: fav.has_community_visible_stats
      ? `http://steamcommunity.com/profiles/${steamid}/stats/${fav.appid}`
      : null
  } : null

  res.render('jogador', {
    player: { ...player, totalGames, notPlayedCount },
    favoriteGame,
    top5Games
  })
})


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static(path.join(__dirname, '..', 'client')))


// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
  console.log('Escutando em: http://localhost:3000')
})