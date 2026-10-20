import Image from "next/image";
import { navigation } from "@/config/navigation";
import { site } from "@/config/site";
import s from "@/style/layout/footer.module.css";
export default async function AppFooter() {
  "use cache";
  return (
    <footer className={s.footer}>
      <div className={`container ${s.inner}`}>
        <div className={s.identity}>
          <a href="/" className={s.brand}>
            <Image src="/images/logo.svg" alt="" width={48} height={48} />
            <strong>OVER THE HILL HUB</strong>
          </a>
          <p>
            Find your next rig, pack for the trail and explore Canada and
            Algeria. Vehicles, maps, gear and practical guides for Over the
            Hill.
          </p>
        </div>
        <div className={s.routes}>
          <h2>Explore</h2>
          <nav aria-label="Footer navigation">
            {navigation.map(([label, href]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className={s.routes}>
          <h2>Legal</h2>
          <nav aria-label="Legal links">
            {[
              ["Privacy Policy", "privacy-policy"],
              ["Terms of Service", "terms-of-service"],
              ["Copyright", "copyright"],
              ["About Us", "about-us"],
              ["Contact Us", "contact-us"],
            ].map(([label, slug]) => (
              <a
                key={slug}
                href={`/legal/${slug}`}
                rel="noopener noreferrer nofollow"
              >
                {label}
              </a>
            ))}
          </nav>
          <p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </div>
      <div className={`container ${s.bottom}`}>
        <p>
          Copyright © {new Date().getFullYear()} overthehillhub.com. All rights
          reserved.
        </p>
        <p>
          An independent fan website. Not affiliated with or endorsed by
          Funselektor or the creators of Over the Hill.
        </p>
      </div>
    </footer>
  );
}
