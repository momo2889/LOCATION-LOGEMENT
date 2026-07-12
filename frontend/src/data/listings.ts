export type ListingType = 'Studio' | 'Chambre' | 'Appartement' | 'Villa';

export interface Listing {
  id: number;
  title: string;
  area: string;
  type: ListingType;
  price: number;
  rooms: number;
  baths: number;
  m2: number;
  rating: number;
  furnished: boolean;
  description: string;
  images: string[];
}

export const listings: Listing[] = [
  {
    id: 1,
    title: 'Appartement 2 pièces moderne',
    area: 'Plateau',
    type: 'Appartement',
    price: 400000,
    rooms: 2,
    baths: 1,
    m2: 75,
    rating: 4.8,
    furnished: false,
    description:
      "Bel appartement au cœur du Plateau, proche des commerces et des transports. Séjour lumineux, cuisine équipée, eau et électricité raccordées. Quartier calme et sécurisé, idéal pour un jeune actif.",
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 2,
    title: 'Villa avec jardin aux Almadies',
    area: 'Almadies',
    type: 'Villa',
    price: 1200000,
    rooms: 4,
    baths: 3,
    m2: 220,
    rating: 4.9,
    furnished: true,
    description:
      "Villa moderne dans le quartier prisé des Almadies, à quelques minutes de la mer. Grands espaces, jardin arboré avec terrasse, cuisine équipée. Idéale pour une famille ou pour la diaspora.",
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 3,
    title: 'Studio meublé lumineux',
    area: 'Mermoz',
    type: 'Studio',
    price: 250000,
    rooms: 1,
    baths: 1,
    m2: 38,
    rating: 4.7,
    furnished: true,
    description:
      "Studio meublé et lumineux à Mermoz, prêt à vivre. Coin cuisine, salle d'eau moderne, internet fibre. Parfait pour un étudiant ou un jeune professionnel.",
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 4,
    title: 'Appartement 3 pièces standing',
    area: 'Point E',
    type: 'Appartement',
    price: 600000,
    rooms: 3,
    baths: 2,
    m2: 110,
    rating: 4.8,
    furnished: false,
    description:
      "Appartement de standing au Point E, résidence sécurisée avec gardien et parking. Trois chambres spacieuses, double séjour, balcon. Proche des écoles et de l'université.",
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 5,
    title: 'Chambre confortable en colocation',
    area: 'Sacré-Cœur',
    type: 'Chambre',
    price: 90000,
    rooms: 1,
    baths: 1,
    m2: 20,
    rating: 4.5,
    furnished: true,
    description:
      "Chambre meublée en colocation à Sacré-Cœur. Espaces communs entretenus, cuisine partagée, ambiance conviviale. Charges comprises.",
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 6,
    title: 'Villa vue mer à Ngor',
    area: 'Ngor',
    type: 'Villa',
    price: 950000,
    rooms: 4,
    baths: 3,
    m2: 190,
    rating: 5.0,
    furnished: true,
    description:
      "Villa avec vue sur mer à Ngor, terrasse et grand séjour ouvert. Prestations haut de gamme, quartier résidentiel au calme, proche de la plage.",
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 7,
    title: 'Studio moderne proche plage',
    area: 'Ouakam',
    type: 'Studio',
    price: 200000,
    rooms: 1,
    baths: 1,
    m2: 34,
    rating: 4.6,
    furnished: false,
    description:
      "Studio neuf à Ouakam, à deux pas de la plage. Finitions soignées, beaucoup de lumière naturelle, quartier vivant et bien desservi.",
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 8,
    title: 'Appartement familial spacieux',
    area: 'Yoff',
    type: 'Appartement',
    price: 500000,
    rooms: 3,
    baths: 2,
    m2: 120,
    rating: 4.7,
    furnished: false,
    description:
      "Grand appartement familial à Yoff, proche de l'aéroport et des commerces. Trois chambres, séjour spacieux, cuisine séparée, buanderie.",
    images: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=900&q=80&auto=format&fit=crop',
    ],
  },
];

export const formatFcfa = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';
