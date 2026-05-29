import { encryptData, decryptData } from "../utils/crypto.js";
import ContactModelsData from "../models/Contacts.js";

const safeDecrypt = (field) => {
  if (!field || !field.encryptedData || !field.iv) return "";
  try {
    return decryptData(field.encryptedData, field.iv);
  } catch (e) {
    return "";
  }
};

const safeEncrypt = (val) => {
  return encryptData(val || "");
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await ContactModelsData.find().sort({ createdAt: -1 });

    const decryptedContacts = contacts.map((c) => ({
      _id: c._id,
      fullName: safeDecrypt(c.fullName),
      phoneNumber: safeDecrypt(c.phoneNumber),
      email: safeDecrypt(c.email),
      address: safeDecrypt(c.address),
      company: safeDecrypt(c.company),
      jobTitle: safeDecrypt(c.jobTitle),
      birthday: safeDecrypt(c.birthday),
      profilePhoto: safeDecrypt(c.profilePhoto),
      whatsAppNumber: safeDecrypt(c.whatsAppNumber),
      website: safeDecrypt(c.website),
      notes: safeDecrypt(c.notes),
      nickname: safeDecrypt(c.nickname),
      groupCategory: c.groupCategory ?? "Other",
      socialMediaLinks: safeDecrypt(c.socialMediaLinks),
      multipleNumbers: safeDecrypt(c.multipleNumbers),
      multipleEmails: safeDecrypt(c.multipleEmails),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json(decryptedContacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      address,
      company,
      jobTitle,
      birthday,
      profilePhoto,
      whatsAppNumber,
      website,
      notes,
      nickname,
      groupCategory,
      socialMediaLinks,
      multipleNumbers,
      multipleEmails,
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ message: "fullName is required" });
    }

    const contact = await ContactModelsData.create({
      fullName: safeEncrypt(fullName),
      phoneNumber: safeEncrypt(phoneNumber),
      email: safeEncrypt(email),
      address: safeEncrypt(address),
      company: safeEncrypt(company),
      jobTitle: safeEncrypt(jobTitle),
      birthday: safeEncrypt(birthday),
      profilePhoto: safeEncrypt(profilePhoto),
      whatsAppNumber: safeEncrypt(whatsAppNumber),
      website: safeEncrypt(website),
      notes: safeEncrypt(notes),
      nickname: safeEncrypt(nickname),
      groupCategory: groupCategory || "Other",
      socialMediaLinks: safeEncrypt(socialMediaLinks),
      multipleNumbers: safeEncrypt(multipleNumbers),
      multipleEmails: safeEncrypt(multipleEmails),
    });

    res.status(201).json({
      message: "Contact stored successfully",
      contact: {
        _id: contact._id,
        fullName,
        phoneNumber,
        email,
        address,
        company,
        jobTitle,
        birthday,
        profilePhoto,
        whatsAppNumber,
        website,
        notes,
        nickname,
        groupCategory: contact.groupCategory,
        socialMediaLinks,
        multipleNumbers,
        multipleEmails,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phoneNumber,
      email,
      address,
      company,
      jobTitle,
      birthday,
      profilePhoto,
      whatsAppNumber,
      website,
      notes,
      nickname,
      groupCategory,
      socialMediaLinks,
      multipleNumbers,
      multipleEmails,
    } = req.body;

    const contact = await ContactModelsData.findById(id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (fullName !== undefined) contact.fullName = safeEncrypt(fullName);
    if (phoneNumber !== undefined) contact.phoneNumber = safeEncrypt(phoneNumber);
    if (email !== undefined) contact.email = safeEncrypt(email);
    if (address !== undefined) contact.address = safeEncrypt(address);
    if (company !== undefined) contact.company = safeEncrypt(company);
    if (jobTitle !== undefined) contact.jobTitle = safeEncrypt(jobTitle);
    if (birthday !== undefined) contact.birthday = safeEncrypt(birthday);
    if (profilePhoto !== undefined) contact.profilePhoto = safeEncrypt(profilePhoto);
    if (whatsAppNumber !== undefined) contact.whatsAppNumber = safeEncrypt(whatsAppNumber);
    if (website !== undefined) contact.website = safeEncrypt(website);
    if (notes !== undefined) contact.notes = safeEncrypt(notes);
    if (nickname !== undefined) contact.nickname = safeEncrypt(nickname);
    if (groupCategory !== undefined) contact.groupCategory = groupCategory;
    if (socialMediaLinks !== undefined) contact.socialMediaLinks = safeEncrypt(socialMediaLinks);
    if (multipleNumbers !== undefined) contact.multipleNumbers = safeEncrypt(multipleNumbers);
    if (multipleEmails !== undefined) contact.multipleEmails = safeEncrypt(multipleEmails);

    await contact.save();

    res.json({
      message: "Contact updated successfully",
      contact: {
        _id: contact._id,
        fullName: fullName || safeDecrypt(contact.fullName),
        phoneNumber: phoneNumber || safeDecrypt(contact.phoneNumber),
        email: email || safeDecrypt(contact.email),
        address: address || safeDecrypt(contact.address),
        company: company || safeDecrypt(contact.company),
        jobTitle: jobTitle || safeDecrypt(contact.jobTitle),
        birthday: birthday || safeDecrypt(contact.birthday),
        profilePhoto: profilePhoto || safeDecrypt(contact.profilePhoto),
        whatsAppNumber: whatsAppNumber || safeDecrypt(contact.whatsAppNumber),
        website: website || safeDecrypt(contact.website),
        notes: notes || safeDecrypt(contact.notes),
        nickname: nickname || safeDecrypt(contact.nickname),
        groupCategory: contact.groupCategory,
        socialMediaLinks: socialMediaLinks || safeDecrypt(contact.socialMediaLinks),
        multipleNumbers: multipleNumbers || safeDecrypt(contact.multipleNumbers),
        multipleEmails: multipleEmails || safeDecrypt(contact.multipleEmails),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ContactModelsData.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
