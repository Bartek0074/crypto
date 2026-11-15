# Crypto Workspace

Prywatny szkielet aplikacji do analizy danych i backtestowania strategii. Projekt nie zawiera jeszcze danych rynkowych ani logiki tradingowej.

## Uruchomienie

Wymagany jest Node.js 20.9 lub nowszy.

```bash
npm install
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000). Pozostałe polecenia: `npm run lint`, `npm run build` i `npm run start` (po zbudowaniu).

Strona główna oraz przykładowe strony `/strategy/strategy-one` i `/strategy/strategy-two` są na razie puste. Nawigacja znajduje się we wspólnym layoucie.

Katalogi `src/features` są miejscem na przyszłe moduły danych rynkowych, wykresów, wskaźników, strategii, backtestingu i optymalizacji. Wykresy oraz silniki wskaźników i backtestingu nie zostały jeszcze dodane.
