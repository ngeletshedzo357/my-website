import { supabase, type Contact } from './supabase';

interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const createContact = async (data: CreateContactData) => {
  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      message: data.message,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating contact:', error);
    throw error;
  }

  return contact;
};
