import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslation } from "react-i18next";

export function GlobalMap() {
  const { t } = useTranslation("main");
  return (
    <section>
      <h2 className="mb-2 text-center font-bold text-3xl">
        {t("global_map_itle", "Global Connection, Easy and Worry-free")}
      </h2>
      <p className="mb-8 text-center text-lg text-muted-foreground">
        {t(
          "global_map_description",
          "Explore seamless global connectivity. Choose network services that suit your needs and stay connected anytime, anywhere."
        )}
      </p>
      <div className="aspect-video min-h-72 w-full overflow-hidden sm:min-h-96">
        <DotLottieReact
          autoplay
          className="h-full w-full"
          loop
          src="/assets/lotties/global-map.json"
        />
      </div>
    </section>
  );
}
