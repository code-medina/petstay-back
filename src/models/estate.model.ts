import { Schema, model, Types } from 'mongoose';

export interface IEstate {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  name: string;
  address: {
    street: string;
    zone: string; // localidad zona o barrio
    city: string;
    state: string; // estado o provincia
    postalCode?: string;
    country: string;
  };
  price: number;
  animalAllowed?: string[];
  maximumAnimalAllowed: number;
  maximumPerson: number;
  rooms: number;
  bathrooms: number;
  hasPatio: boolean;
  patioDimensions?: {
    length: number;
    width: number;
  };
  description?: string;
  rentalType: 'monthly' | 'daily' | 'annual' | 'holiday';
  availabilityFor:Date;
  imagesUrl:string[]
}
const EstateSchema = new Schema<IEstate>(
  {
    imagesUrl:{type:[String],default:[]},
    availabilityFor:{type:Date,required:true},
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      maxLength: [30, 'name must be less than 30 characters'],
    },
    address: {
      street: { type: String, required: true },
      zone: { type: String, trim: true, required: true },
      city: { type: String, trim: true, required: true },
      postalCode: { type: String },
      state: { type: String, trim: true, required: true },
      country: { type: String, trim: true, required: true },
    },
    price: {
      type: Number,
      required: true,
    },
    animalAllowed: {
      type: [String],
      default: [],
    },
    maximumAnimalAllowed: { type: Number, required: true },
    maximumPerson: { type: Number, required: true },
    rooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    hasPatio: { type: Boolean, required: true },
    patioDimensions: {
      length: {
        type: Number,
        required: function () {
          return this.hasPatio === true;
        },
      },
      width: {
        type: Number,
        required: function () {
          return this.hasPatio === true;
        },
      },
    },
    description: {
      type: String,
      maxLength: [500, 'description  must be less than 500 characters'],
    },
    rentalType: {
      type: String,
      enum: ['annual', 'holiday', 'daily', 'monthly'],
      required: true,
    },
  },
  { timestamps: true },
);
//index
EstateSchema.index({ 'address.zone': 1 });
//modelo
export const Estate = model<IEstate>('Estate', EstateSchema);
