import { GeoSelector } from "@repo/share-ui/components/ui/geo-selector";
import { getCitiesAction, getCountriesAction, getStatesAction } from "../../actions/geo";
import CascaderTest from "./components/cascader-test";

export default function GeoSelectorPage() {
  return (
    <div className="p-8">
      <CascaderTest />
      <GeoSelector fetchCountries={getCountriesAction} fetchStates={getStatesAction} fetchCities={getCitiesAction} />
    </div>
  );
}
