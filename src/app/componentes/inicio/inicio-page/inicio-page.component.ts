import { Component } from '@angular/core';
import { BlogSectionComponent } from '../blog-section/blog-section.component';
import { ContactoSectionComponent } from '../contacto-section/contacto-section.component';
import { HeroSectionComponent } from '../hero-section/hero-section.component';
import { QuienesSomosSectionComponent } from '../quienes-somos-section/quienes-somos-section.component';
import { ServiciosSectionComponent } from '../servicios-section/servicios-section.component';

@Component({
  selector: 'app-inicio-page',
  imports: [
    HeroSectionComponent,
    QuienesSomosSectionComponent,
    ServiciosSectionComponent,
    BlogSectionComponent,
    ContactoSectionComponent,
  ],
  template: `
    <app-hero-section />
    <app-quienes-somos-section />
    <app-servicios-section />
    <app-blog-section />
    <app-contacto-section />
  `,
})
export class InicioPageComponent {}
