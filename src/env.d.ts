/// <reference types="astro/client" />
declare namespace App {
  interface Locals { post?: import('./lib/site-content').Post }
}
