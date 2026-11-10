import { Component } from '@angular/core';
import { BlogSectionComponent } from '../blog-section/blog-section.component';
import { ContactoSectionComponent } from '../contacto-section/contacto-section.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { QuienesSomosSectionComponent } from '../quienes-somos-section/quienes-somos-section.component';
import { ServiciosSectionComponent } from '../servicios-section/servicios-section.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { SiteHeaderComponent } from '../site-header/site-header.component';

@Component({
  selector: 'app-inicio-page',
  imports: [
    SiteHeaderComponent,
    HeroSectionComponent,
    QuienesSomosSectionComponent,
    ServiciosSectionComponent,
    BlogSectionComponent,
    ContactoSectionComponent,
    SiteFooterComponent,
  ],
  template: `
    <a
      href="#contenido"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-[#F3F4F6] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#1F2937]"
    >
      Saltar al contenido
    </a>

    <div class="min-h-screen bg-[#FFFFFF]">
      <app-site-header />

      <main id="contenido">
        <app-hero-section />
        <app-quienes-somos-section />
        <app-servicios-section />
        <app-blog-section />
        <app-contacto-section />
      </main>

      <app-site-footer />
    </div>
  `,
})
export class InicioPageComponent {}
