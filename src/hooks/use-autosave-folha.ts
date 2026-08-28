import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type Options = {
  /** Só agenda/executa quando true (folha editável). */
  enabled: boolean;
  /** Executa a gravação das linhas pendentes. Deve resolver após confirmação do servidor. */
  run: () => Promise<void>;
  /** Debounce em ms (padrão 900). */
  delay?: number;
};

/**
 * Autosalvamento em segundo plano com debounce e fila.
 * - `schedule()` agenda uma gravação (reinicia o timer a cada digitação).
 * - `flush()` grava imediatamente (usado no onBlur).
 * - Se chegar alteração durante um envio, reagenda ao final (sem chamadas concorrentes).
 */
export function useAutosaveFolha({ enabled, run, delay = 900 }: Options) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const runRef = useRef(run);
  runRef.current = run;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const againRef = useRef(false);

  const execute = useCallback(async () => {
    if (!enabledRef.current) return;
    if (inFlightRef.current) {
      againRef.current = true;
      return;
    }
    inFlightRef.current = true;
    setStatus("saving");
    try {
      await runRef.current();
      setStatus("saved");
    } catch (e) {
      console.error("AUTOSAVE: falha ao salvar", e);
      setStatus("error");
    } finally {
      inFlightRef.current = false;
      if (againRef.current) {
        againRef.current = false;
        void execute();
      }
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(() => {
    if (!enabledRef.current) return;
    clearTimer();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void execute();
    }, delay);
  }, [clearTimer, delay, execute]);

  /** Dispara imediatamente (onBlur / saída da página). */
  const flush = useCallback(() => {
    clearTimer();
    void execute();
  }, [clearTimer, execute]);

  const retry = useCallback(() => {
    flush();
  }, [flush]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { status, schedule, flush, retry };
}
