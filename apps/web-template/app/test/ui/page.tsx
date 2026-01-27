import { GeoSelector } from "@repo/share-ui/components/ui/geo-selector";
import { getCitiesAction, getCountriesAction, getStatesAction } from "../../actions/geo";

export default async function GeoSelectorPage() {
  await getCountriesAction();
  return (
    <div className="p-8">
      <GeoSelector fetchCountries={getCountriesAction} fetchStates={getStatesAction} fetchCities={getCitiesAction} />
    </div>
  );
}
