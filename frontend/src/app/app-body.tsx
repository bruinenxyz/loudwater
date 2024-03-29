import { BlueprintProvider } from "@blueprintjs/core";
import { usePathname } from "next/navigation";
import NavigationBar from "./navigation-bar";
import { useDarkModeContext } from "@/components/context/dark-mode-context";
import { PrivateRouteGuard } from "@/guards/route-guard/PrivateRouteGuard";

const noLayoutPaths = ["/auth/*"];

export default function AppBody({
  children,
  isUsingAuth,
  clerkPubKey,
}: {
  children: React.ReactNode;
  isUsingAuth?: boolean;
  clerkPubKey?: string;
}) {
  const path = usePathname();
  const { darkMode, setDarkMode } = useDarkModeContext();

  const getBodyClassName = () => {
    // console.log("Calling for class", darkMode);
    if (darkMode) {
      return "bp5-dark dark-container";
    } else {
      return "light-container";
    }
  };

  const routeGuard = () => {
    if (isUsingAuth && clerkPubKey) {
      return <PrivateRouteGuard>{children}</PrivateRouteGuard>;
    } else {
      return children;
    }
  };

  if (noLayoutPaths.some((p) => path.match(p))) {
    return (
      <body className={getBodyClassName()}>
        <div className="flex h-screen max-h-screen">{routeGuard()}</div>
      </body>
    );
  }

  return (
    <BlueprintProvider>
      <body className={getBodyClassName()}>
        <div className="flex flex-col sm:flex-row">
          <div
            className={`w-[200px] hidden sm:block fixed h-screen transition-all duration-200 
            ease-out`}
          >
            <NavigationBar />
          </div>
          <div
            className={
              "w-[calc(100%-200px)] sm:left-[200px] h-[calc(100%-60px)] sm:h-full absolute"
            }
          >
            {routeGuard()}
          </div>
        </div>
      </body>
    </BlueprintProvider>
  );
}
