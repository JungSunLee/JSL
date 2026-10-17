/**
 * 체감온도 계산 (기상청 산출식).
 * - 겨울철: 기온 10℃ 이하, 풍속 1.3m/s 이상일 때 바람냉각 체감온도
 * - 여름철: 기온 24℃ 이상일 때 습구온도(Stull) 기반 체감온도
 */
export function windChill(tempC: number, windMs: number): number {
  const v = Math.pow(windMs * 3.6, 0.16);
  return 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * tempC * v;
}

export function wetBulbStull(tempC: number, rh: number): number {
  return (
    tempC * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.67633) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035
  );
}

export function summerFeelsLike(tempC: number, rh: number): number {
  const tw = wetBulbStull(tempC, rh);
  return -0.2442 + 0.55399 * tw + 0.45535 * tempC - 0.0022 * tw * tw + 0.00278 * tw * tempC + 3.0;
}

export function feelsLike(tempC: number, humidity: number, windMs: number): number {
  let v = tempC;
  if (tempC <= 10 && windMs >= 1.3) v = windChill(tempC, windMs);
  else if (tempC >= 24) v = summerFeelsLike(tempC, humidity);
  return Math.round(v * 10) / 10;
}
