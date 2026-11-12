import { Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  local?: boolean;
}

@Component({
  selector: 'app-contacto-section',
  imports: [RouterLink],
  templateUrl: './contacto-section.component.html',
  styleUrl: './contacto-section.component.css',
})
export class ContactoSectionComponent {
  @ViewChild('conversation') private conversation?: ElementRef<HTMLElement>;
  private readonly destroyRef = inject(DestroyRef);
  private controller?: AbortController;
  readonly draft = signal('');
  readonly sending = signal(false);
  readonly error = signal('');
  readonly messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      local: true,
      content:
        '¡Hola! Soy el asistente virtual de vetclinic. Qué gusto tenerte aquí. Puedo ayudarte con nuestros servicios, precios, horarios y los pasos para cuidar de tu mascota con nosotros. ¿Qué te gustaría saber?',
    },
  ]);
  readonly suggestions = [
    { label: 'Servicios y precios', question: '¿Qué servicios ofrecen y cuáles son sus precios?' },
    { label: 'Agendar una cita', question: '¿Cómo registro a mi perro y agendo una cita?' },
    { label: 'Horarios de atención', question: '¿Cuál es su horario y atienden en festivos?' },
  ];
  readonly faqs = [
    {
      question: '¿Dónde nos encuentras?',
      answer: 'Carrera 45 # 48-31, Sede Plaza de la Paz, Barranquilla.',
    },
    {
      question: '¿En qué horario atendemos?',
      answer:
        'Lunes a sábado de 7:00 a. m. a 6:00 p. m. Domingos de 7:00 a. m. a 1:00 p. m. Los festivos conservan el horario del día correspondiente.',
    },
    {
      question: '¿Cómo cancelar o reprogramar?',
      answer:
        'Acércate a recepción o llama al 3042818284. No tiene cargos adicionales; la nueva fecha está sujeta a disponibilidad.',
    },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => this.controller?.abort());
  }

  async send(question = this.draft()): Promise<void> {
    const message = question.trim();
    if (!message || message.length > 1200 || this.sending()) return;
    const history = this.messages()
      .filter((m) => !m.local)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
    this.messages.update((list) => [...list, { role: 'user', content: message }]);
    this.draft.set('');
    this.error.set('');
    this.sending.set(true);
    this.scroll();
    const controller = new AbortController();
    this.controller = controller;
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
      // fetch evita enviar el token de sesión del backend al servicio público del chat.
      const response = await fetch(environment.chatbotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.answer !== 'string' || !data.answer.trim()) {
        throw new Error(
          response.status === 429
            ? 'Hemos recibido varias preguntas. Espera un minuto y vuelve a intentarlo.'
            : 'No pudimos conectar con el asistente. Puedes consultar las preguntas frecuentes o llamar a recepción.',
        );
      }
      this.messages.update((list) => [
        ...list,
        { role: 'assistant', content: data.answer.replace(/\*\*/g, '') },
      ]);
    } catch (error) {
      if (!this.destroyRef.destroyed) {
        this.error.set(
          error instanceof Error && error.message.startsWith('Hemos')
            ? error.message
            : 'El asistente no pudo responder en este momento. Consulta las preguntas frecuentes o llámanos al 3042818284.',
        );
        // No enviar turnos fallidos como contexto en la siguiente consulta.
        this.messages.update((list) =>
          list.map((m, index) => (index === list.length - 1 ? { ...m, local: true } : m)),
        );
        this.draft.set(message);
      }
    } finally {
      clearTimeout(timeout);
      if (!this.destroyRef.destroyed) {
        this.sending.set(false);
        this.scroll();
      }
    }
  }

  submit(event: Event): void {
    event.preventDefault();
    void this.send();
  }
  private scroll(): void {
    setTimeout(() => {
      const panel = this.conversation?.nativeElement;
      if (panel && !this.destroyRef.destroyed) panel.scrollTop = panel.scrollHeight;
    });
  }
}
