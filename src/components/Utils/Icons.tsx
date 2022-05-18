import { SvgIconComponent } from "@mui/icons-material";
import {
  Stack,
  SvgIcon,
  SvgIconProps,
  Typography,
  TypographyVariant,
} from "@mui/material";
import { grey } from "@mui/material/colors";
// eslint-disable-next-line import/first
import DragonIcon from "../../images/DragonIcon02.png";

function DiscordIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z" />
      </svg>
    </SvgIcon>
  );
}

function CircleCloseIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM175 208.1L222.1 255.1L175 303C165.7 312.4 165.7 327.6 175 336.1C184.4 346.3 199.6 346.3 208.1 336.1L255.1 289.9L303 336.1C312.4 346.3 327.6 346.3 336.1 336.1C346.3 327.6 346.3 312.4 336.1 303L289.9 255.1L336.1 208.1C346.3 199.6 346.3 184.4 336.1 175C327.6 165.7 312.4 165.7 303 175L255.1 222.1L208.1 175C199.6 165.7 184.4 165.7 175 175C165.7 184.4 165.7 199.6 175 208.1V208.1z" />
      </svg>
    </SvgIcon>
  );
}

interface IconHeaderProps {
  color?: string;
  icon: SvgIconComponent;
  iconSize?: string;
  iconColor?: string;
  header: string;
  headerSize?: TypographyVariant;
  headerColor?: string;
  [key: string]: any;
}
function IconHeader({
  color = "inherit",
  icon,
  iconSize = "5rem",
  iconColor = "inherit",
  header,
  headerSize = "h3",
  headerColor = "inherit",
  ...props
}: IconHeaderProps) {
  return (
    <Stack
      direction="column"
      justifyItems="center"
      color={color}
      alignItems="center"
    >
      <Typography fontSize={iconSize} lineHeight={0} color={iconColor}>
        <SvgIcon component={icon} fontSize="inherit" color="inherit" />
      </Typography>

      <Typography
        variant={headerSize}
        fontWeight="bold"
        color={headerColor}
        justifyItems="center"
        alignItems="cneter"
      >
        {header}
      </Typography>

      {props.children}
    </Stack>
  );
}

function Kbd(props: any) {
  return (
    <kbd
      style={{
        background: grey[300],
        boxShadow: "1px 1px " + grey[400],
        borderRadius: "2px",
        borderWidth: "1px 1px 3px",
        fontSize: "0.8em",
        fontWeight: "bold",
        paddingInline: "0.4em",
        whiteSpace: "nowrap",
      }}
    >
      {props.children}
    </kbd>
  );
}

export { DiscordIcon, IconHeader, CircleCloseIcon, DragonIcon, Kbd };
