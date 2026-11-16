import type { ContactContent } from '@/lib/content/blocks';

export type SalonLocation={id:string;name:string;address:string;plusCode:string;phone:string;mapEmbedUrl:string;
  /** exact pin of the salon's Google listing; used for the map and directions when set */
  coords?:{lat:number;lng:number}};

/* Kaleliya: Google mis-resolves its short plus code (54M7+9C8) when it is sent
   as a text query, so the map and directions use the listing's coordinates.
   The embed is a place embed (same format as Pasyala's) built from the
   Google listing's feature id, so the map shows the "VERO Salon" card with
   rating and an Open in Maps button. */
const KALELIYA={lat:7.183539,lng:80.1138238};
const KALELIYA_PLACE='0x3ae31d0062cb428b%3A0x9fa3bcf069cb897c';
const KALELIYA_EMBED=`https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d700!2d${KALELIYA.lng}!3d${KALELIYA.lat}!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${KALELIYA_PLACE}!2sVERO%20Salon!5e0!3m2!1sen!2slk!4v1782989017848!5m2!1sen!2slk`;

export function salonLocations(contact:ContactContent):SalonLocation[]{
  return [
    {id:'pasyala',name:'Pasyala',address:contact.address,plusCode:'545H+F6',phone:contact.phonePrimary,mapEmbedUrl:contact.mapEmbedUrl||`https://www.google.com/maps?q=${encodeURIComponent('545H+F6 Pasyala, Sri Lanka')}&z=16&output=embed`},
    {id:'kaleliya',name:'Kaleliya',address:'68/S, Mallewa, Kaleliya',plusCode:'54M7+9C8',phone:'077 369 9620',coords:KALELIYA,mapEmbedUrl:KALELIYA_EMBED},
  ];
}
export function locationDirections(location:SalonLocation){
  const destination=location.coords?`${location.coords.lat},${location.coords.lng}`:`${location.plusCode}, ${location.name}, Sri Lanka`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
