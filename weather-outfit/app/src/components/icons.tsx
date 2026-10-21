import type { OutfitItem, PrecipType, Sky } from '@wo/core';
import type { ComponentType } from 'react';
import type { IconProps } from 'phosphor-react-native';
import { ArrowClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowClockwise';
import { BabyIcon } from 'phosphor-react-native/src/icons/Baby';
import { BackpackIcon } from 'phosphor-react-native/src/icons/Backpack';
import { BaseballCapIcon } from 'phosphor-react-native/src/icons/BaseballCap';
import { BeanieIcon } from 'phosphor-react-native/src/icons/Beanie';
import { BellIcon } from 'phosphor-react-native/src/icons/Bell';
import { BootIcon } from 'phosphor-react-native/src/icons/Boot';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ChatCircleIcon } from 'phosphor-react-native/src/icons/ChatCircle';
import { CloudIcon } from 'phosphor-react-native/src/icons/Cloud';
import { CloudMoonIcon } from 'phosphor-react-native/src/icons/CloudMoon';
import { CloudRainIcon } from 'phosphor-react-native/src/icons/CloudRain';
import { CloudSnowIcon } from 'phosphor-react-native/src/icons/CloudSnow';
import { CloudSunIcon } from 'phosphor-react-native/src/icons/CloudSun';
import { CoatHangerIcon } from 'phosphor-react-native/src/icons/CoatHanger';
import { DeviceMobileIcon } from 'phosphor-react-native/src/icons/DeviceMobile';
import { DropIcon } from 'phosphor-react-native/src/icons/Drop';
import { FaceMaskIcon } from 'phosphor-react-native/src/icons/FaceMask';
import { FanIcon } from 'phosphor-react-native/src/icons/Fan';
import { FileTextIcon } from 'phosphor-react-native/src/icons/FileText';
import { FootprintsIcon } from 'phosphor-react-native/src/icons/Footprints';
import { GearIcon } from 'phosphor-react-native/src/icons/Gear';
import { GiftIcon } from 'phosphor-react-native/src/icons/Gift';
import { HandPalmIcon } from 'phosphor-react-native/src/icons/HandPalm';
import { HeartbeatIcon } from 'phosphor-react-native/src/icons/Heartbeat';
import { HoodieIcon } from 'phosphor-react-native/src/icons/Hoodie';
import { InfoIcon } from 'phosphor-react-native/src/icons/Info';
import { ListIcon } from 'phosphor-react-native/src/icons/List';
import { MapPinIcon } from 'phosphor-react-native/src/icons/MapPin';
import { MegaphoneIcon } from 'phosphor-react-native/src/icons/Megaphone';
import { MoonIcon } from 'phosphor-react-native/src/icons/Moon';
import { PantsIcon } from 'phosphor-react-native/src/icons/Pants';
import { PencilIcon } from 'phosphor-react-native/src/icons/Pencil';
import { PlusIcon } from 'phosphor-react-native/src/icons/Plus';
import { ScrollIcon } from 'phosphor-react-native/src/icons/Scroll';
import { ShoppingBagIcon } from 'phosphor-react-native/src/icons/ShoppingBag';
import { SignOutIcon } from 'phosphor-react-native/src/icons/SignOut';
import { SneakerIcon } from 'phosphor-react-native/src/icons/Sneaker';
import { SnowflakeIcon } from 'phosphor-react-native/src/icons/Snowflake';
import { SparkleIcon } from 'phosphor-react-native/src/icons/Sparkle';
import { SunIcon } from 'phosphor-react-native/src/icons/Sun';
import { SunglassesIcon } from 'phosphor-react-native/src/icons/Sunglasses';
import { ThermometerIcon } from 'phosphor-react-native/src/icons/Thermometer';
import { TrashIcon } from 'phosphor-react-native/src/icons/Trash';
import { TShirtIcon } from 'phosphor-react-native/src/icons/TShirt';
import { UmbrellaIcon } from 'phosphor-react-native/src/icons/Umbrella';
import { UserCircleIcon } from 'phosphor-react-native/src/icons/UserCircle';
import { UsersIcon } from 'phosphor-react-native/src/icons/Users';
import { WarningIcon } from 'phosphor-react-native/src/icons/Warning';
import { WindIcon } from 'phosphor-react-native/src/icons/Wind';
import { BarbellIcon } from 'phosphor-react-native/src/icons/Barbell';
import { CheckSquareIcon } from 'phosphor-react-native/src/icons/CheckSquare';
import { FireIcon } from 'phosphor-react-native/src/icons/Fire';
import { HandWavingIcon } from 'phosphor-react-native/src/icons/HandWaving';
import { PersonIcon } from 'phosphor-react-native/src/icons/Person';
import { PersonArmsSpreadIcon } from 'phosphor-react-native/src/icons/PersonArmsSpread';
import { PersonSimpleIcon } from 'phosphor-react-native/src/icons/PersonSimple';
import { SmileyIcon } from 'phosphor-react-native/src/icons/Smiley';
import { SquareIcon } from 'phosphor-react-native/src/icons/Square';
import { WrenchIcon } from 'phosphor-react-native/src/icons/Wrench';
import { XIcon } from 'phosphor-react-native/src/icons/X';

/**
 * 앱 전체에서 쓰는 아이콘. 이모지 대신 Phosphor(MIT) 선 아이콘으로 통일한다.
 * 가져오기는 아이콘 단위로 해서 번들을 작게 유지한다.
 */
export type IconComponent = ComponentType<IconProps>;

export const Icons = {
  // 날씨
  Sun: SunIcon,
  Moon: MoonIcon,
  Cloud: CloudIcon,
  CloudSun: CloudSunIcon,
  CloudMoon: CloudMoonIcon,
  CloudRain: CloudRainIcon,
  CloudSnow: CloudSnowIcon,
  Wind: WindIcon,
  Drop: DropIcon,
  Thermometer: ThermometerIcon,
  Snowflake: SnowflakeIcon,
  // 옷·소품
  Hoodie: HoodieIcon,
  CoatHanger: CoatHangerIcon,
  TShirt: TShirtIcon,
  Pants: PantsIcon,
  Sneaker: SneakerIcon,
  Boot: BootIcon,
  Footprints: FootprintsIcon,
  Umbrella: UmbrellaIcon,
  Sunglasses: SunglassesIcon,
  FaceMask: FaceMaskIcon,
  BaseballCap: BaseballCapIcon,
  Beanie: BeanieIcon,
  Backpack: BackpackIcon,
  HandPalm: HandPalmIcon,
  Fan: FanIcon,
  // UI
  Users: UsersIcon,
  Baby: BabyIcon,
  Bell: BellIcon,
  List: ListIcon,
  Gear: GearIcon,
  UserCircle: UserCircleIcon,
  Sparkle: SparkleIcon,
  Gift: GiftIcon,
  MapPin: MapPinIcon,
  ShoppingBag: ShoppingBagIcon,
  CaretRight: CaretRightIcon,
  ArrowClockwise: ArrowClockwiseIcon,
  DeviceMobile: DeviceMobileIcon,
  Heartbeat: HeartbeatIcon,
  FileText: FileTextIcon,
  Scroll: ScrollIcon,
  Megaphone: MegaphoneIcon,
  ChatCircle: ChatCircleIcon,
  Info: InfoIcon,
  SignOut: SignOutIcon,
  Trash: TrashIcon,
  Pencil: PencilIcon,
  Plus: PlusIcon,
  Warning: WarningIcon,
  X: XIcon,
  CheckSquare: CheckSquareIcon,
  Square: SquareIcon,
  HandWaving: HandWavingIcon,
  Wrench: WrenchIcon,
  // 체형·온도감
  Person: PersonIcon,
  PersonSimple: PersonSimpleIcon,
  PersonArmsSpread: PersonArmsSpreadIcon,
  Barbell: BarbellIcon,
  Smiley: SmileyIcon,
  Fire: FireIcon,
} as const;

/** 하늘·강수·밤낮에 맞는 날씨 아이콘 */
export function weatherIconFor(sky: Sky, precip: PrecipType, night = false): IconComponent {
  if (precip === 'snow' || precip === 'rainSnow') return CloudSnowIcon;
  if (precip === 'rain' || precip === 'shower') return CloudRainIcon;
  if (sky === 'cloudy') return CloudIcon;
  if (sky === 'partly') return night ? CloudMoonIcon : CloudSunIcon;
  return night ? MoonIcon : SunIcon;
}

export function WeatherIcon({ sky, precip, night, size = 24, color = '#fff', weight = 'fill' }: { sky: Sky; precip: PrecipType; night?: boolean; size?: number; color?: string; weight?: IconProps['weight'] }) {
  const C = weatherIconFor(sky, precip, night);
  return <C size={size} color={color} weight={weight} />;
}

/** 옷·소품 카테고리 → 아이콘. 구체적인 것부터 먼저 검사 */
const OUTFIT_ICONS: [RegExp, IconComponent][] = [
  [/padding|bunting|coat|trench|jacket|cardigan|windbreaker/i, HoodieIcon],
  [/thermal|knit|sweatshirt|longsleeve|tshirt|sleeveless|bodysuit/i, TShirtIcon],
  [/shorts|leggings|fleece|jeans|cotton/i, PantsIcon],
  [/sandals|socks/i, FootprintsIcon],
  [/boots/i, BootIcon],
  [/sneakers/i, SneakerIcon],
  [/umbrella/i, UmbrellaIcon],
  [/sunscreen/i, DropIcon],
  [/mask/i, FaceMaskIcon],
  [/scarfGloves/i, HandPalmIcon],
  [/beanie/i, BeanieIcon],
  [/sunhat|acc\.hat/i, BaseballCapIcon],
  [/cooling/i, FanIcon],
];

export function outfitIconFor(item: OutfitItem): IconComponent {
  const hit = OUTFIT_ICONS.find(([re]) => re.test(item.category));
  if (hit) return hit[1];
  return item.slot === 'outer' ? HoodieIcon : item.slot === 'top' ? TShirtIcon : item.slot === 'bottom' ? PantsIcon : item.slot === 'shoes' ? SneakerIcon : BackpackIcon;
}

/** 추천 엔진 알림(이모지 아이콘) → 선 아이콘 */
export function alertIconFor(alert: { icon: string; level: 'info' | 'caution' | 'warning' }): IconComponent {
  const map: Record<string, IconComponent> = {
    '🌡️': ThermometerIcon,
    '❄️': SnowflakeIcon,
    '☔': UmbrellaIcon,
    '🌂': UmbrellaIcon,
    '💧': DropIcon,
    '💨': WindIcon,
    '🕶️': SunglassesIcon,
    '😷': FaceMaskIcon,
    '🧢': BaseballCapIcon,
    '🧴': DropIcon,
    '🧼': HandPalmIcon,
    '🥵': SunIcon,
    '🥶': SnowflakeIcon,
    '🤒': HeartbeatIcon,
  };
  return map[alert.icon] ?? (alert.level === 'warning' ? WarningIcon : InfoIcon);
}
