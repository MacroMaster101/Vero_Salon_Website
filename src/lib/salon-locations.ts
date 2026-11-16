import type { ContactContent } from '@/lib/content/blocks';

export type SalonLocation={id:string;name:string;address:string;plusCode:string;phone:string;mapEmbedUrl:string};
export function salonLocations(contact:ContactContent):SalonLocation[]{
  return [
    {id:'pasyala',name:'Pasyala',address:contact.address,plusCode:'545H+F6',phone:contact.phonePrimary,mapEmbedUrl:contact.mapEmbedUrl||`https://www.google.com/maps?q=${encodeURIComponent('545H+F6 Pasyala, Sri Lanka')}&z=16&output=embed`},
    {id:'kaleliya',name:'Kaleliya',address:'Kaleliya',plusCode:'54M7+9C8',phone:'077 369 9620',mapEmbedUrl:`https://www.google.com/maps?q=${encodeURIComponent('54M7+9C8, Kaleliya, Sri Lanka')}&z=16&output=embed`},
  ];
}
export function locationDirections(location:SalonLocation){
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${location.plusCode}, ${location.name}, Sri Lanka`)}`;
}
