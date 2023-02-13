import { ICategory } from "../category/category.model";
export interface IProduct {
    id?: number;
    category: ICategory;
    series: string;
    path: string;
    appointment: string;
    length: number;
    blade_length: number;
    blade_material: string;
    steel_brand: string;
    sharpening_blade: string;
    producing_country: string;
    price: number;
    count:number;
    image: string;
}