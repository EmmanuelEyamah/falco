import Svg, { Circle, Path } from "react-native-svg";

interface LogoMarkProps {
  size?: number;
  color?: string;
}

// Four rotors around a hub, seen from above.
export const LogoMark = ({ size = 28, color = "#0A0B0D" }: LogoMarkProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path d="M11.2 11.2 20.8 20.8M20.8 11.2 11.2 20.8" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    <Circle cx={8} cy={8} r={5} stroke={color} strokeWidth={2.4} />
    <Circle cx={24} cy={8} r={5} stroke={color} strokeWidth={2.4} />
    <Circle cx={8} cy={24} r={5} stroke={color} strokeWidth={2.4} />
    <Circle cx={24} cy={24} r={5} stroke={color} strokeWidth={2.4} />
    <Circle cx={16} cy={16} r={3.6} fill={color} />
  </Svg>
);
