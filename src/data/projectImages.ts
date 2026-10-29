export const projectGroups = [
  {
    title: 'Entry',
    images: [
      { name: 'page-03-entry', alt: 'Showroom entrance with a circular metal screen and marble floor' },
    ],
  },
  {
    title: 'Dining area',
    images: [
      { name: 'page-04-dining-area', alt: 'Showroom dining area with a sculptural table and chandelier' },
      { name: 'page-05-dining-area', alt: 'Showroom dining area beside a circular metal screen' },
    ],
  },
  {
    title: 'Living area',
    images: [
      { name: 'page-06-living-area', alt: 'Showroom living area with pale seating and pendant lights' },
      { name: 'page-07-living-area', alt: 'Showroom living area with sofas, shelving and marble floor' },
    ],
  },
  {
    title: 'Bedroom',
    images: [
      { name: 'page-08-bedroom', alt: 'Showroom bedroom with a marble floor and glass partition' },
      { name: 'page-09-bedroom', alt: 'Showroom bedroom with a low bed and warm pendant lights' },
      { name: 'page-10-bedroom', alt: 'Showroom bedroom viewed toward a glass partition' },
    ],
  },
  {
    title: 'Reception',
    images: [
      { name: 'page-12-reception', alt: 'Showroom reception with two bronze desks and dark stone wall' },
      { name: 'page-13-reception', alt: 'Showroom reception viewed along a planted walkway' },
    ],
  },
  {
    title: 'Room 1',
    images: [
      { name: 'page-14-room-1', alt: 'Showroom room 1 with a centered bed and textured wall' },
      { name: 'page-15-room-1', alt: 'Showroom room 1 with a bed beside the reception area' },
    ],
  },
  {
    title: 'Room 2',
    images: [
      { name: 'page-16-room-2', alt: 'Showroom room 2 with facing sofas and chandeliers' },
      { name: 'page-17-room-2', alt: 'Showroom room 2 with a sofa and built-in shelving' },
    ],
  },
  {
    title: 'Room 3',
    images: [
      { name: 'page-18-room-3', alt: 'Showroom room 3 with curved sofas facing the windows' },
      { name: 'page-19-room-3', alt: 'Showroom room 3 with curved sofas and patterned wall' },
      { name: 'page-20-room-3', alt: 'Showroom room 3 dining area beside a large window' },
      { name: 'page-21-room-3', alt: 'Showroom room 3 dining area with upholstered chairs' },
      { name: 'page-22-room-3', alt: 'Showroom room 3 living area with two pale sofas and chandeliers' },
      { name: 'page-23-room-3', alt: 'Showroom room 3 living area with pale sofas and a textured wall' },
    ],
  },
  {
    title: 'Room 4',
    images: [
      { name: 'page-24-room-4', alt: 'Showroom room 4 with three pale sofas and a circular chandelier' },
      { name: 'page-25-room-4', alt: 'Showroom room 4 with sofas beside a planted divider' },
    ],
  },
  {
    title: 'Room 5',
    images: [
      { name: 'page-26-room-5', alt: 'Showroom room 5 dining area with a table beside tall windows' },
      { name: 'page-27-room-5', alt: 'Showroom room 5 dining area with upholstered chairs and flowers' },
      { name: 'page-28-room-5', alt: 'Showroom room 5 living area with a curved sofa and chandeliers' },
      { name: 'page-29-room-5', alt: 'Showroom room 5 living area with a curved sofa beside a window' },
    ],
  },
  {
    title: 'Room 6',
    images: [
      { name: 'page-30-room-6', alt: 'Showroom room 6 dining area with timber bookshelves and a burgundy rug' },
      { name: 'page-31-room-6', alt: 'Showroom room 6 dining area with timber bookshelves and black display units' },
    ],
  },
] as const

export const homeShowroomScenes = [
  {
    name: 'page-03-entry',
    label: 'Entrance',
    alt: 'Maison Debrah showroom entrance with its sign above a circular metal screen',
  },
  {
    name: 'page-24-room-4',
    label: 'Living area',
    alt: 'Maison Debrah showroom living area with pale sofas and a circular chandelier',
  },
  {
    name: 'page-04-dining-area',
    label: 'Dining area',
    alt: 'Maison Debrah showroom dining area with a sculptural table and chandelier',
  },
] as const

type CollectionShowroomScene = {
  image: string
  alt: string
  description: string
}

export const collectionShowroomScenes: Record<string, CollectionShowroomScene> = {
  all: {
    image: 'page-24-room-4',
    alt: 'Furnished living area inside the Maison Debrah showroom',
    description: 'Browse furniture, lighting and decoration from the Maison Debrah collection.',
  },
  meubilair: {
    image: 'page-22-room-3',
    alt: 'Living area with sofas and tables inside the Maison Debrah showroom',
    description: 'Explore furniture for living, dining and bedroom spaces.',
  },
  'banken-hoekbanken': {
    image: 'page-24-room-4',
    alt: 'Pale sofas arranged in the Maison Debrah showroom',
    description: 'Browse sofas and sectionals alongside a view of our furnished showroom.',
  },
  'fauteuils-statement-stoelen': {
    image: 'page-07-living-area',
    alt: 'Seating and shelving in a Maison Debrah showroom living area',
    description: 'Explore armchairs and statement seating inspired by complete interiors.',
  },
  eetkamertafels: {
    image: 'page-04-dining-area',
    alt: 'Dining table and chandelier inside the Maison Debrah showroom',
    description: 'Explore dining tables with inspiration from our showroom dining spaces.',
  },
  'eetkamerstoelen-barkrukken': {
    image: 'page-27-room-5',
    alt: 'Dining chairs arranged around a table inside the Maison Debrah showroom',
    description: 'Browse dining seating and see how we bring a dining room together.',
  },
  'bedden-hoofdborden': {
    image: 'page-09-bedroom',
    alt: 'Bedroom interior inside the Maison Debrah showroom',
    description: 'Browse beds and headboards with inspiration from our bedroom spaces.',
  },
  verlichting: {
    image: 'page-18-room-3',
    alt: 'Sculptural chandelier above a Maison Debrah showroom living area',
    description: 'Explore lighting and see it within a furnished showroom space.',
  },
  decoratie: {
    image: 'page-30-room-6',
    alt: 'Styled dining area with flowers and shelving in the Maison Debrah showroom',
    description: 'Browse decorative pieces and discover how we style complete spaces.',
  },
}
