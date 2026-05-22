import { Quiz } from '../types';
import narutoImg from '../assets/images/naruto_new_quiz_1779465865940.png';
import pokemonImg from '../assets/images/pokemon_quiz_1779465478892.png';
import onepieceImg from '../assets/images/onepiece_new_quiz_1779465904725.png';
import dragonballImg from '../assets/images/db_goku_centered_1779467093769.png';
import demonslayerImg from '../assets/images/demonslayer_quiz_1779465528165.png';
import deathnoteImg from '../assets/images/deathnote_new_quiz_1779467338525.png';

export const QUIZZES: Quiz[] = [
  {
    id: 'naruto',
    title: 'Naruto',
    description: 'Teste seus conhecimentos sobre o mundo ninja!',
    category: 'Shonen',
    backgroundImage: narutoImg,
    questions: [
      {
        id: 'n1',
        text: 'Quem foi o primeiro mestre de Naruto?',
        options: ['Kakashi', 'Iruka', 'Jiraiya', 'Ebisu'],
        correctAnswer: 1,
      },
      {
        id: 'n2',
        text: 'Qual é a Bijū de nove caudas?',
        options: ['Shukaku', 'Matatabi', 'Kurama', 'Gyūki'],
        correctAnswer: 2,
      },
      {
        id: 'n3',
        text: 'Quem matou o clã Uchiha?',
        options: ['Madara', 'Obito', 'Itachi', 'Sasuke'],
        correctAnswer: 2,
      },
      {
        id: 'n4',
        text: 'Qual é o nome da vila de Naruto?',
        options: ['Konohagakure', 'Sunagakure', 'Kirigakure', 'Kumogakure'],
        correctAnswer: 0,
      },
      {
        id: 'n5',
        text: 'Qual é o objetivo principal de Naruto?',
        options: ['Ser um ninja médico', 'Se tornar Hokage', 'Vingar seu clã', 'Explorar o mundo'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'pokemon',
    title: 'Pokémon',
    description: 'Você conhece todos esses monstros de bolso?',
    category: 'Aventura',
    backgroundImage: pokemonImg,
    questions: [
      {
        id: 'p1',
        text: 'Qual é o Pokémon inicial de fogo da região de Kanto?',
        options: ['Cyndaquil', 'Torchic', 'Charmander', 'Chimchar'],
        correctAnswer: 2,
      },
      {
        id: 'p2',
        text: 'Qual é o tipo principal do Pikachu?',
        options: ['Água', 'Grama', 'Fogo', 'Elétrico'],
        correctAnswer: 3,
      },
      {
        id: 'p3',
        text: 'Quantas evoluções o Eevee tem atualmente?',
        options: ['3', '5', '8', '9'],
        correctAnswer: 2,
      },
      {
        id: 'p4',
        text: 'Quem é o eterno rival de Ash em Kanto?',
        options: ['Gary', 'Brock', 'Misty', 'Paul'],
        correctAnswer: 0,
      },
      {
        id: 'p5',
        text: 'Qual Pokémon é conhecido como o deus de todos os Pokémon?',
        options: ['Mewtwo', 'Arceus', 'Rayquaza', 'Dialga'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'onepiece',
    title: 'One Piece',
    description: 'Rumo ao Grand Line!',
    category: 'Shonen',
    backgroundImage: onepieceImg,
    questions: [
      {
        id: 'op1',
        text: 'Quem é o capitão dos Piratas do Chapéu de Palha?',
        options: ['Zoro', 'Sanji', 'Luffy', 'Nami'],
        correctAnswer: 2,
      },
      {
        id: 'op2',
        text: 'Qual é o nome da Akuma no Mi do Luffy?',
        options: ['Gomu Gomu no Mi', 'Mera Mera no Mi', 'Hito Hito no Mi', 'Ope Ope no Mi'],
        correctAnswer: 0,
      },
      {
        id: 'op3',
        text: 'Qual é o sonho de Zoro?',
        options: ['Encontrar o One Piece', 'Ser o melhor espadachim', 'Descobrir o All Blue', 'Mapear o mundo'],
        correctAnswer: 1,
      },
      {
        id: 'op4',
        text: 'Quem é o cozinheiro do bando?',
        options: ['Usopp', 'Franky', 'Brook', 'Sanji'],
        correctAnswer: 3,
      },
      {
        id: 'op5',
        text: 'Como é chamado o navio atual do Luffy?',
        options: ['Going Merry', 'Thousand Sunny', 'Red Force', 'Oro Jackson'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'dragonball',
    title: 'Dragon Ball',
    description: 'Oi, eu sou o Goku!',
    category: 'Shonen',
    backgroundImage: dragonballImg,
    questions: [
      {
        id: 'db1',
        text: 'Qual é a raça de Goku?',
        options: ['Humano', 'Saiyajin', 'Namekuseijin', 'Freeza'],
        correctAnswer: 1,
      },
      {
        id: 'db2',
        text: 'Quem é o príncipe dos Saiyajins?',
        options: ['Gohan', 'Broly', 'Vegeta', 'Trunks'],
        correctAnswer: 2,
      },
      {
        id: 'db3',
        text: 'Quantas Esferas do Dragão existem?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 2,
      },
      {
        id: 'db4',
        text: 'Qual é a técnica assinatura de Goku ensinada pelo Sr. Kaio?',
        options: ['Kamehameha', 'Kaio-ken', 'Big Bang Attack', 'Special Beam Cannon'],
        correctAnswer: 1,
      },
      {
        id: 'db5',
        text: 'Quem matou o Freeza pela primeira vez?',
        options: ['Goku', 'Vegeta', 'Trunks do Futuro', 'Piccolo'],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: 'demonslayer',
    title: 'Demon Slayer',
    description: 'A jornada de Tanjiro para salvar sua irmã.',
    category: 'Ação',
    backgroundImage: demonslayerImg,
    questions: [
      {
        id: 'ds1',
        text: 'Como a Nezuko viaja durante o dia?',
        options: ['Em uma caixa nas costas de Tanjiro', 'Em uma carroça', 'Usando um chapéu', 'Voando'],
        correctAnswer: 0,
      },
      {
        id: 'ds2',
        text: 'Qual é a Respiração usada por Tanjiro?',
        options: ['Respiração do Trovão', 'Respiração da Fera', 'Respiração da Água', 'Respiração do Som'],
        correctAnswer: 2,
      },
      {
        id: 'ds3',
        text: 'Quem é o vilão principal, criador dos onis?',
        options: ['Akaza', 'Muzan Kibutsuji', 'Enmu', 'Kokushibo'],
        correctAnswer: 1,
      },
      {
        id: 'ds4',
        text: 'Qual Hashira usa a Respiração do Inseto?',
        options: ['Giyu Tomioka', 'Kyojuro Rengoku', 'Shinobu Kocho', 'Mitsuri Kanro'],
        correctAnswer: 2,
      },
      {
        id: 'ds5',
        text: 'Qual é o nome da espada usada pelos matadores de onis?',
        options: ['Zanpakuto', 'Nichirin', 'Kubikiribocho', 'Kusanagi'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 'deathnote',
    title: 'Death Note',
    description: 'Um duelo de intelectos entre Light e L. Quem vencerá?',
    category: 'Mistério',
    backgroundImage: deathnoteImg,
    questions: [
      {
        id: 'dn1',
        text: 'Qual é o nome do Shinigami que acompanha Light Yagami?',
        options: ['Rem', 'Ryuk', 'Sidoh', 'Gelus'],
        correctAnswer: 1,
      },
      {
        id: 'dn2',
        text: 'Qual é o verdadeiro nome de L?',
        options: ['L Lawliet', 'Light Lawliet', 'Linda Lawliet', 'Logan Lawliet'],
        correctAnswer: 0,
      },
      {
        id: 'dn3',
        text: 'Como Light é conhecido pelo público e pela polícia?',
        options: ['Justiceiro', 'Kira', 'Deus do Novo Mundo', 'Shinigami'],
        correctAnswer: 1,
      },
      {
        id: 'dn4',
        text: 'O que acontece se uma pessoa tiver seu nome escrito no Death Note sem causa da morte especificada?',
        options: ['Morre de ataque cardíaco', 'Morre dormindo', 'Sofre um acidente', 'Nada acontece'],
        correctAnswer: 0,
      },
      {
        id: 'dn5',
        text: 'Light usa qual pseudônimo para entrar na força-tarefa?',
        options: ['Hideki Ryuga', 'Melo', 'Near', 'Teru Mikami'],
        correctAnswer: 0,
      },
    ],
  },
];
