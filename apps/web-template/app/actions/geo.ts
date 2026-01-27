"use server";

import { getCitiesOfState, getCountries, getStatesOfCountry } from "@countrystatecity/countries";

export async function getCountriesAction() {
  const data = await getCountries();
  return data.map((item) => ({
    name: item.name,
    iso2: item.iso2,
    phonecode: item.phonecode,
    emoji: item.emoji,
  }));
}

export async function getStatesAction(countryCode: string) {
  const data = await getStatesOfCountry(countryCode);
  return data.map((item) => ({
    name: item.name,
    iso2: item.iso2,
  }));
}

export async function getCitiesAction(countryCode: string, stateCode: string) {
  const data = await getCitiesOfState(countryCode, stateCode);
  return data.map((item) => ({
    name: item.name,
  }));
}
