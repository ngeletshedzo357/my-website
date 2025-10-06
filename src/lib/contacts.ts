interface CreateContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const createContact = async (data: CreateContactData) => {
  const contact = {
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    message: data.message,
    created_at: new Date().toISOString(),
  };

  console.log('Contact message received:', contact);

  return contact;
};
