"use client";
import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  EventInput,
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/ui/modal";

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
  };
}

const COLOR_OPTIONS = [
  { label: "Urgente", value: "Danger", colorClass: "danger" },
  { label: "Despacho", value: "Success", colorClass: "success" },
  { label: "Normal", value: "Primary", colorClass: "primary" },
  { label: "Atención", value: "Warning", colorClass: "warning" },
];

const Calendar: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventLevel, setEventLevel] = useState("Primary");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const calendarRef = useRef<FullCalendar>(null);
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    // Eventos iniciales en español
    setEvents([
      {
        id: "1",
        title: "Conferencia de Proveedores",
        start: new Date().toISOString().split("T")[0],
        extendedProps: { calendar: "Danger" },
      },
      {
        id: "2",
        title: "Reunión de Despacho",
        start: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        extendedProps: { calendar: "Success" },
      },
      {
        id: "3",
        title: "Mantenimiento de Flota",
        start: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        end: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        extendedProps: { calendar: "Primary" },
      },
    ]);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetModalFields();
    setEventStartDate(selectInfo.startStr);
    setEventEndDate(selectInfo.endStr || selectInfo.startStr);
    openModal();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    setSelectedEvent(event as unknown as CalendarEvent);
    setEventTitle(event.title);
    setEventStartDate(event.start?.toISOString().split("T")[0] || "");
    setEventEndDate(event.end?.toISOString().split("T")[0] || "");
    setEventLevel(event.extendedProps.calendar || "Primary");
    openModal();
  };

  const handleAddOrUpdateEvent = () => {
    if (!eventTitle.trim()) return;

    if (selectedEvent) {
      // Actualizar evento existente
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: eventTitle,
                start: eventStartDate,
                end: eventEndDate,
                extendedProps: { calendar: eventLevel },
              }
            : event
        )
      );
    } else {
      // Agregar nuevo evento
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventTitle,
        start: eventStartDate,
        end: eventEndDate,
        allDay: true,
        extendedProps: { calendar: eventLevel },
      };
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    }
    closeModal();
    resetModalFields();
  };

  const resetModalFields = () => {
    setEventTitle("");
    setEventStartDate("");
    setEventEndDate("");
    setEventLevel("Primary");
    setSelectedEvent(null);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="custom-calendar">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          locales={[esLocale]}
          headerToolbar={{
            left: "prev,next addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          customButtons={{
            addEventButton: {
              text: "Nuevo Evento +",
              click: openModal,
            },
          }}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[650px] p-6 lg:p-8"
      >
        <div className="flex flex-col px-1 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-1 font-bold text-gray-900 text-lg dark:text-white/90 lg:text-xl">
              {selectedEvent ? "Editar Evento" : "Nuevo Evento"}
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Programa y gestiona entregas, reuniones o recordatorios operativos.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Título del Evento
              </label>
              <input
                id="event-title"
                type="text"
                placeholder="Ej: Despacho a obra Santiago"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Prioridad / Categoría
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {COLOR_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    htmlFor={`modal${opt.value}`}
                    className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="event-level"
                      value={opt.value}
                      id={`modal${opt.value}`}
                      checked={eventLevel === opt.value}
                      onChange={() => setEventLevel(opt.value)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 mr-2"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Fecha de Inicio
                </label>
                <input
                  id="event-start-date"
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all shadow-xs"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Fecha de Fin
                </label>
                <input
                  id="event-end-date"
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/70 px-3.5 text-xs text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white transition-all shadow-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mt-6 justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={closeModal}
              type="button"
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddOrUpdateEvent}
              type="button"
              disabled={!eventTitle.trim()}
              className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg shadow-xs transition-all"
            >
              {selectedEvent ? "Guardar Cambios" : "Agregar Evento"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const renderEventContent = (eventInfo: EventContentArg) => {
  const colorClass = `fc-bg-${(eventInfo.event.extendedProps.calendar || "primary").toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm`}>
      <div className="fc-daygrid-event-dot"></div>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title font-medium">{eventInfo.event.title}</div>
    </div>
  );
};

export default Calendar;
