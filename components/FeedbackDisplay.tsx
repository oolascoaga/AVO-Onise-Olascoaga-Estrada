import React from 'react';
import { CheckCircle2, AlertCircle, BookOpen, MapPin, ArrowRight } from 'lucide-react';

interface FeedbackDisplayProps {
  text: string;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ text }) => {
  // Simple parser to extract feedback sections if they exist in the text
  // The agent is instructed to use specific headers.
  
  const hasFeedback = text.includes("Retroalimentación") || text.includes("**Retroalimentación**");

  if (!hasFeedback) return null;

  // Helper to extract content between lines
  const extractSection = (keyword: string) => {
    const regex = new RegExp(`${keyword}:\\s*(.*?)(\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const aciertos = extractSection("Aciertos");
  const mejoras = extractSection("Aspectos por mejorar");
  const correccion = extractSection("Corrección conceptual");
  const contexto = extractSection("Conexión con el contexto minero");
  const paso = extractSection("Siguiente paso sugerido");

  if (!aciertos && !mejoras) return null; // Fallback if parsing fails loosely

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-sm">
      <div className="bg-mining-gold/10 px-4 py-2 border-b border-mining-gold/20 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-mining-gold-dark" />
        <span className="font-semibold text-mining-gold-dark">Evaluación Formativa</span>
      </div>
      <div className="p-4 space-y-3">
        {aciertos && (
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Aciertos</p>
              <p className="text-gray-600">{aciertos}</p>
            </div>
          </div>
        )}
        {mejoras && (
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Aspectos por mejorar</p>
              <p className="text-gray-600">{mejoras}</p>
            </div>
          </div>
        )}
        {correccion && (
          <div className="flex gap-3">
            <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Concepto Clave</p>
              <p className="text-gray-600">{correccion}</p>
            </div>
          </div>
        )}
        {contexto && (
          <div className="flex gap-3">
            <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Contexto Bajo Cauca</p>
              <p className="text-gray-600">{contexto}</p>
            </div>
          </div>
        )}
        {paso && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2 items-center text-mining-gold-dark font-medium">
            <ArrowRight className="w-4 h-4" />
            <span>{paso}</span>
          </div>
        )}
      </div>
    </div>
  );
};