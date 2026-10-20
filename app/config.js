// Contenu du lanceur. Les applis absentes de la TV sont masquées automatiquement.
// Pour trouver l'id d'une appli : tizen.application.getAppsInfo() depuis la TV.
//
// Visuel d'une marque :
//   bg         : dégradé de la carte [début, fin] (deux fois la même couleur pour un fond uni)
//   glow       : couleur de la lumière d'ambiance quand la carte est sélectionnée
//   logo       : fichier dans app/logos/ (sans logo, le nom s'affiche en texte)
//   white      : affiche un logo d'une seule couleur en blanc
//   logoHeight : hauteur max du logo en % de la carte (42 par défaut ; plus pour les icônes carrées)
//   text       : couleur du nom quand il n'y a pas de logo
//   badge      : petite étiquette en bas à droite de la carte
window.LAUNCHER_CONFIG = {
  // Logos servis par jsDelivr quand la page tourne dans TizenBrew.
  assetsBase: 'https://cdn.jsdelivr.net/gh/gramosukaj/tizenbrew-launcher@main/app/',

  modules: {
    title: 'TizenBrew',
    hidden: ['gh/gramosukaj/tizenbrew-launcher@main'],
    brands: {
      'npm/@foxreis/tizentube': {
        name: 'YouTube', tagline: 'Sans publicité, avec SponsorBlock et DeArrow',
        bg: ['#272727', '#0F0F0F'], glow: '#FF0033', logo: 'youtube.svg'
      },
      'npm/tizentwitch': {
        name: 'Twitch', tagline: 'Les streams en direct, sans publicité',
        bg: ['#26262C', '#0E0E10'], glow: '#9146FF', logo: 'twitch.svg'
      },
      'npm/@gforceweb/smarttv-twitch-hls': {
        name: 'Twitch HLS', tagline: "Lecteur alternatif, jusqu'en 1440p",
        bg: ['#2A1F45', '#0E0E10'], glow: '#7C4DFF', logo: 'twitch.svg', badge: 'HLS'
      }
    }
  },

  sections: [
    {
      title: 'Streaming',
      apps: [
        { id: 'org.tizen.netflix-app', name: 'Netflix', tagline: 'Films, séries et documentaires',
          bg: ['#1F1F1F', '#000000'], glow: '#E50914', logo: 'netflix.svg' },
        { id: 'org.tizen.primevideo', name: 'Prime Video', tagline: 'Films, séries et sport en direct',
          bg: ['#0F2236', '#00050D'], glow: '#1A98FF', logo: 'primevideo.svg' },
        { id: 'MCmYXNxgcu.DisneyPlus', name: 'Disney+', tagline: 'Disney, Pixar, Marvel, Star Wars et National Geographic',
          bg: ['#0E3A6E', '#040A1F'], glow: '#2A9DD8', logo: 'disneyplus.svg', white: true },
        { id: 'QmpwflxWdt.CanalPlusLauncher', name: 'CANAL+', tagline: 'Chaînes CANAL+, cinéma, séries et sport',
          bg: ['#000000', '#000000'], glow: '#BFC7D0', logo: 'canalplus.svg' },
        { id: 'vbUQClczfR.Wuakitv', name: 'Rakuten TV', tagline: 'Films en location et chaînes gratuites',
          bg: ['#D10A0A', '#7F0000'], glow: '#FF1F1F', logo: 'rakutentv.svg', white: true },
        { id: 'WG2lklBRNT.SmartTVNextGen', name: 'Pathé Home', tagline: 'Les films du cinéma, à la maison',
          bg: ['#FFC426', '#FFC426'], glow: '#FFC200', logo: 'pathehome.png', logoHeight: 82 }
      ]
    },
    {
      title: 'Chaînes TV',
      apps: [
        { id: 'znCs95n93Q.OqeeTV', name: 'OQEE', tagline: 'Les chaînes Freebox TV en direct et en replay',
          bg: ['#FFFFFF', '#FFFFFF'], glow: '#E4002B', logo: 'oqee.png', logoHeight: 82 },
        { id: 'QY16tZ64E3.francetv', name: 'france.tv', tagline: 'France 2, 3, 4, 5 et franceinfo, en direct et en replay',
          bg: ['#FFFFFF', '#E9ECF2'], glow: '#5468FF', logo: 'francetv.svg' },
        { id: 'aLlph042JZ.arte', name: 'ARTE', tagline: 'Cinéma, documentaires et culture',
          bg: ['#1C1C1C', '#050505'], glow: '#FA481C', logo: 'arte.svg' },
        { id: 'E0P3lRI4H7.MYTF1', name: 'TF1+', tagline: 'TF1, TMC, TFX et LCI, en direct et en replay',
          bg: ['#2D5BFF', '#0A1C9E'], glow: '#2E5BFF', logo: 'tf1plus.svg', white: true },
        { id: 'Ol7HVEXtqh.6play', name: 'M6+', tagline: 'M6, W9 et 6ter, en direct et en replay',
          bg: ['#FFFFFF', '#ECECEC'], glow: '#F5C400', logo: 'm6plus.svg' },
        { id: 'bstjKvX6LM.molotov', name: 'Molotov', tagline: 'La télé en direct, simplement',
          bg: ['#2A2A2A', '#0C0C0C'], glow: '#FFC800', logo: 'molotov.svg' },
        { id: 'BnhhSh4SVH.SFR', name: 'RMC BFM Play', tagline: 'Info et sport en direct',
          bg: ['#DB0034', '#DB0034'], glow: '#E0003A', logo: 'rmcbfmplay.svg' },
        { id: 'rKpKZvmSog.IPTVSmartersPro', name: 'IPTV Smarters', tagline: 'Lecteur de listes IPTV',
          bg: ['#4730D6', '#4730D6'], glow: '#5B4BFF', logo: 'iptvsmarters.png', logoHeight: 82 }
      ]
    },
    {
      title: 'Musique, jeux & web',
      apps: [
        { id: 'rJeHak5zRg.Spotify', name: 'Spotify', tagline: 'Musique et podcasts',
          bg: ['#1F1F1F', '#090909'], glow: '#1DB954', logo: 'spotify.svg' },
        { id: 'GHI3a0zMSx.XboxGamePass', name: 'Xbox', tagline: 'Xbox Cloud Gaming, sans console',
          bg: ['#16A116', '#0B5C0B'], glow: '#107C10', logo: 'xbox.svg', white: true },
        { id: 'CmeyUlnhYY.LunaWebApp', name: 'Amazon Luna', tagline: 'Jeux en streaming',
          bg: ['#24124F', '#0B0619'], glow: '#9146FF', logo: 'amazonluna.svg' },
        { id: 'MiUDVawh7P.UtomikTizen', name: 'Utomik', tagline: 'Des centaines de jeux à la demande',
          bg: ['#15B446', '#15B446'], glow: '#22C55E', logo: 'utomik.png', logoHeight: 60 },
        { id: 'org.tizen.browser', name: 'Internet', tagline: 'Le navigateur web de la TV',
          bg: ['#33415C', '#141B2B'], glow: '#5B8DEF', logo: 'internet.svg' }
      ]
    }
  ]
};
