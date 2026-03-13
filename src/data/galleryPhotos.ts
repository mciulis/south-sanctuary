export interface GalleryPhoto {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface GallerySection {
  label: string;
  photos: GalleryPhoto[];
}

export const gallerySections: GallerySection[] = [
  {
    label: "The Entry",
    photos: [
      {
        src: "/images/home/hero-forest-view-01.jpg",
        width: 1720,
        height: 1290,
        alt: "The forest behind South Sanctuary",
      },
      {
        src: "/images/home/detail-entry-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The entry hallway",
      },
      {
        src: "/images/home/gallery-living-north-stairs-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The staircase looking north",
      },
      {
        src: "/images/home/living-south-windows-02.jpg",
        width: 3000,
        height: 2000,
        alt: "Looking down through the glass railings into the main living space",
      },
    ],
  },
  {
    label: "The Kitchen",
    photos: [
      {
        src: "/images/home/kitchen-island-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The kitchen island with dark matte cabinetry and copper pendant lights",
      },
      {
        src: "/images/home/kitchen-island-02.jpg",
        width: 3000,
        height: 2000,
        alt: "The kitchen island from the far end",
      },
      {
        src: "/images/home/gallery-kitchen-fireplace-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The kitchen looking toward the dining area and fireplace",
      },
      {
        src: "/images/home/kitchen-fireplace-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The kitchen fireplace and dining table",
      },
    ],
  },
  {
    label: "The Living Room",
    photos: [
      {
        src: "/images/home/gallery-living-east-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The living room looking east",
      },
      {
        src: "/images/home/living-south-windows-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The eleven south-facing windows looking into the forest",
      },
      {
        src: "/images/home/living-south-windows-03.jpg",
        width: 3000,
        height: 2000,
        alt: "The south windows and the canopy beyond",
      },
      {
        src: "/images/home/living-north-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The living room looking north",
      },
      {
        src: "/images/home/retreat-drinks-room-landscape-01.jpg",
        width: 1720,
        height: 1290,
        alt: "The sitting area with a view south through the windows",
      },
      {
        src: "/images/home/retreat-drinks-room-landscape-02.jpg",
        width: 1720,
        height: 1290,
        alt: "The sitting area in warm afternoon light",
      },
      {
        src: "/images/home/retreat-drinks-room-south-window-01.jpg",
        width: 968,
        height: 1290,
        alt: "Looking south through the window into the trees",
      },
      {
        src: "/images/home/desk-area-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The desk area",
      },
    ],
  },
  {
    label: "The Retreat",
    photos: [
      {
        src: "/images/home/retreat-bedroom-master-02.jpg",
        width: 3000,
        height: 2000,
        alt: "The master bedroom",
      },
      {
        src: "/images/home/bedroom-master-east-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The master bedroom looking east",
      },
      {
        src: "/images/home/bedroom-master-west-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The master bedroom looking west",
      },
      {
        src: "/images/home/bedroom-master-fireplace-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The master bedroom fireplace",
      },
      {
        src: "/images/home/retreat-bathroom-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The master bathroom — soaking tub in niche, floating oak vanity",
      },
      {
        src: "/images/home/retreat-deck-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The private master deck looking into the trees",
      },
      {
        src: "/images/home/retreat-drinks-room-portrait-01.jpg",
        width: 968,
        height: 1290,
        alt: "The sitting room in the retreat",
      },
      {
        src: "/images/home/retreat-drinks-room-portrait-02.jpg",
        width: 968,
        height: 1290,
        alt: "The retreat sitting room detail",
      },
      {
        src: "/images/home/retreat-drinks-room-portrait-03.jpg",
        width: 968,
        height: 1290,
        alt: "The retreat sitting room in evening light",
      },
      {
        src: "/images/home/retreat-drinks-room-outside-01.jpg",
        width: 968,
        height: 1290,
        alt: "The view outside from the retreat",
      },
    ],
  },
  {
    label: "The Bedrooms",
    photos: [
      {
        src: "/images/home/bedroom-guest1-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The first guest bedroom",
      },
      {
        src: "/images/home/bedroom-guest2-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The second guest bedroom",
      },
      {
        src: "/images/home/detail-bedroom.jpg",
        width: 1720,
        height: 1290,
        alt: "Bedroom detail",
      },
      {
        src: "/images/home/gallery-guest-bathroom-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The guest bathroom",
      },
    ],
  },
  {
    label: "The Bonus Room",
    photos: [
      {
        src: "/images/home/bonus-room-main-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The bonus room",
      },
      {
        src: "/images/home/bonus-room-gym-01.jpg",
        width: 3000,
        height: 2000,
        alt: "The bonus room configured as a gym",
      },
    ],
  },
];

export const allGalleryPhotos: GalleryPhoto[] = gallerySections.flatMap(
  (s) => s.photos
);
