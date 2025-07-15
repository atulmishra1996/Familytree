export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  parentIds: string[];
  childrenIds: string[];
  spouseId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePersonInput {
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  parentIds?: string[];
  spouseId?: string;
  notes?: string;
}

export interface UpdatePersonInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  placeOfBirth?: string;
  phoneNumber?: string;
  profilePhoto?: string;
  notes?: string;
}