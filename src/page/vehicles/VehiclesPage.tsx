import PageSchema from "@/seo/PageSchema";
import Breadcrumb from "@/components/content/Breadcrumb";
import VehicleCatalog from "./VehicleCatalog";
import { vehicles, toSearchItem } from "@/lib/data/catalog";
import { staticMetadata } from "@/seo/metadata";
import { tdk } from "@/seo/tdk";
import s from "@/style/page/vehicles/vehicles.module.css";
export const metadata = staticMetadata("/vehicles");
export default function VehiclesPage() {
  return (
    <section className={s.page}>
      <div className="container">
        <PageSchema path="/vehicles" />
        <Breadcrumb items={[{ label: "Vehicles", href: "/vehicles" }]} />
        <header className={s.garageHero}>
          <div className={s.heroCopy}>
            <span className={s.kicker}>THE GARAGE / OVER THE HILL</span>
            <h1>{tdk["/vehicles"].h1}</h1>
            <p>
              Compare stock setups, engine upgrades and trail unlocks. Every
              detail, right here.
            </p>
          </div>
          <div className={s.garageStats}>
            <span>
              <strong>{vehicles.length}</strong> vehicles
            </span>
            <span>
              <strong>
                {new Set(vehicles.map((vehicle) => vehicle.category)).size}
              </strong>{" "}
              classes
            </span>
          </div>
        </header>
        <VehicleCatalog
          items={vehicles.map((vehicle) => ({
            ...toSearchItem(vehicle, "/vehicles"),
            referenceImage: vehicle.referenceImage,
            referenceImageAlt: vehicle.referenceImageAlt,
            engineStages: vehicle.engineStages,
            detailFacts: vehicle.detailFacts,
            notes: vehicle.playerNotes,
          }))}
        />
        <section className={s.garageTips}>
          <div>
            <span>01 / FIND IT</span>
            <h2>Check the unlock objective</h2>
            <p>
              Burro now links to Hermit Trail in Emerald Lake. Named release
              rewards are listed on each vehicle; the earlier Rocky Ascent
              objective is kept as Demo history.
            </p>
          </div>
          <div>
            <span>02 / BUILD IT</span>
            <h2>Check parts for your vehicle</h2>
            <p>
              A complete set of 16 upgrades costs 675 Pebbles per vehicle. Each
              engine table shows the stock and purchased tiers; the figures
              describe game settings, not measured trail speeds.
            </p>
          </div>
          <div>
            <span>03 / MAKE IT YOURS</span>
            <h2>Customize at merchants and cabins</h2>
            <p>
              Change colours, liveries and accessories when you stop at a
              merchant or cabin. These appearance options are separate from
              mechanical upgrades.
            </p>
          </div>
        </section>
        <section className={s.related}>
          <div>
            <span className={s.kicker}>PACK. UPGRADE. EXPLORE.</span>
            <h2>Parts and recovery gear</h2>
            <p>
              Check upgrade costs or look up how the winch, jack and repair kit
              work before equipping your vehicle.
            </p>
          </div>
          <nav aria-label="Prepare your vehicle">
            <a href="/wiki/upgrades#upgrade-system">Upgrades →</a>
            <a href="/wiki/equipment#winch">Recovery equipment →</a>
          </nav>
        </section>
      </div>
    </section>
  );
}
