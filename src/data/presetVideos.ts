import { PresetVideo } from '../types';

export const PRESET_VIDEOS: PresetVideo[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny (MP4 Demo)',
    description: 'Animação clássica de código aberto com decisões interativas sobre a tela.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
    type: 'mp4',
    defaultQuestions: [
      {
        id: 'q1',
        timestamp: 5,
        title: 'Qual caminho o personagem deve escolher agora?',
        subtitle: 'Selecione uma das opções abaixo para o vídeo continuar:',
        options: [
          { id: 'A', label: 'Seguir pelo caminho da floresta ensolarada', isCorrect: true, feedbackText: 'Excelente! A floresta é o caminho mais seguro.' },
          { id: 'B', label: 'Explorar a caverna escura ao lado', isCorrect: false, feedbackText: 'Cuidado! A caverna é desconhecida.' },
          { id: 'C', label: 'Descansar perto do riacho refrescante', isCorrect: false, feedbackText: 'Apenas uma breve pausa antes de seguir.' },
          { id: 'D', label: 'Subir na grande árvore de carvalho', isCorrect: false, feedbackText: 'Você tem uma visão ampla da paisagem!' }
        ]
      },
      {
        id: 'q2',
        timestamp: 12,
        title: 'Qual deve ser a próxima decisão do vídeo?',
        subtitle: 'Escolha uma alternativa entre A, B, C ou D:',
        options: [
          { id: 'A', label: 'Saltar para o trecho final (Avançar 5s)', jumpToTime: 18, feedbackText: 'Saltando para o segundo 18...' },
          { id: 'B', label: 'Continuar a reprodução normalmente', feedbackText: 'Prosseguindo com o vídeo!' },
          { id: 'C', label: 'Voltar ao início do vídeo', jumpToTime: 0, feedbackText: 'Reiniciando o vídeo do começo.' },
          { id: 'D', label: 'Pausar e revisar a explicação', feedbackText: 'Revisando os detalhes...' }
        ]
      }
    ]
  },
  {
    id: 'elephants-dream',
    title: 'Elephant\'s Dream (MP4 Demo)',
    description: 'Vídeo MP4 com perguntas e testes interativos programados.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    type: 'mp4',
    defaultQuestions: [
      {
        id: 'q1_ed',
        timestamp: 6,
        title: 'Qual o tema principal desta animação 3D?',
        subtitle: 'Teste seus conhecimentos sobre o vídeo:',
        options: [
          { id: 'A', label: 'Computação gráfica open source e ficção científica', isCorrect: true, feedbackText: 'Correto! É a primeira animação aberta do Blender.' },
          { id: 'B', label: 'Um documentário sobre a vida selvagem', isCorrect: false },
          { id: 'C', label: 'Tutorial de edição de áudio digital', isCorrect: false },
          { id: 'D', label: 'Apresentação comercial de um produto', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'for-bigger-blazes',
    title: 'Nature & Landscape Tech Showcase',
    description: 'Vídeo MP4 com paisagens dinâmicas e quizzes interativos sobre o conteúdo.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
    type: 'mp4',
    defaultQuestions: [
      {
        id: 'q1_blazes',
        timestamp: 4,
        title: 'Qual elemento natural é destacado nesta cena?',
        subtitle: 'Responda para continuar assistindo:',
        options: [
          { id: 'A', label: 'Montanhas e formações rochosas', isCorrect: true },
          { id: 'B', label: 'Oceano e tempestades tropicais', isCorrect: false },
          { id: 'C', label: 'Desertos de areia e dunas', isCorrect: false },
          { id: 'D', label: 'Gleba de gelo e glaciares', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'youtube-sample',
    title: 'Vídeo do YouTube (Exemplo)',
    description: 'URL do YouTube detectada e convertida automaticamente para embed responsivo.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    posterUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1200&auto=format&fit=crop',
    type: 'youtube'
  }
];

