"use server";
import type { ICity, ICountry, IState } from "@countrystatecity/countries";
import { getCitiesOfState, getCountries, getStatesOfCountry } from "@countrystatecity/countries";

export async function getCountriesAction(): Promise<ICountry[]> {
  return await getCountries();
}

export async function getStatesAction(countryCode: string): Promise<IState[]> {
  return await getStatesOfCountry(countryCode);
}
export async function getCitiesAction(countryCode: string, stateCode: string): Promise<ICity[]> {
  return await getCitiesOfState(countryCode, stateCode);
}
