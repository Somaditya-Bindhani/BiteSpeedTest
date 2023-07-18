const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getContact = async (req, res) => {
  try {
    const id = req.primaryContactId;
    //gets all the contacts that has either id same as the primary contact or linkedid same as the primary contact
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [{ id: id }, { linkedId: id }],
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    let primaryContact = contacts.length
      ? contacts.find((ele) => ele.linkPrecedence === "primary")
      : null;

    //using set to avoid to duplicate in emails and phone numbers
    const emails = new Set();
    const phoneNumbers = new Set();
    const secondaryContactId = [];

    for (const ele of contacts) {
      emails.add(ele.email);
      phoneNumbers.add(ele.phoneNumber);
      if (ele.linkPrecedence !== "primary" && ele.id) {
        secondaryContactId.push(ele.id);
      }
    }
    const response = {
      primaryContactId: primaryContact.id,
      emails: [...emails],
      phoneNumbers: [...phoneNumbers],
      secondaryContactId,
    };
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error." });
  }
};

const contactHandler = async (req, res, next) => {
  try {
    const { email, phoneNumber } = req.body;
    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: "Each checkout must have an email or phone number",
      });
    }
    let filter = [];
    if (email) {
      filter = [
        {
          email,
        },
      ];
    }
    if (phoneNumber) {
      filter = [
        ...filter,
        {
          phoneNumber,
        },
      ];
    }
    let data;

    //getting all the rows that has the email or phone number or both
    const contactExists = await prisma.contact.findMany({
      where: {
        OR: filter,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    //creating a new primary contact if there the email and phone number not found in db
    if (!contactExists.length) {
      data = await prisma.contact.create({
        data: {
          email: email ? email : null,
          phoneNumber: phoneNumber ? phoneNumber : null,
          linkedId: null,
          linkPrecedence: "primary",
          createdAt: new Date(),
          updatedAt: null,
          deleteAt: null,
        },
      });
      req.primaryContactId = data.id;
      return next();
    }

    //getting the primary contact list for linkage
    const primaryContactArray = contactExists.filter(
      (ele) => ele.linkPrecedence === "primary"
    );
    const primaryContact = primaryContactArray[0] || null;
    const primaryContactId = primaryContact
      ? primaryContact.id
      : contactExists[0].linkedId;

    //passing the primary contact id to next fucntion to get all the contacts
    req.primaryContactId = primaryContactId;

    // if the primary contact will ever change into a secondary contact then there will be 2 parimary contact
    // in the db at that time , first will be treated as primary and second will be updated to secondary
    if (primaryContactArray.length > 1) {
      data = await prisma.contact.update({
        where: { id: primaryContactArray[1].id },
        data: {
          linkPrecedence: "secondary",
          linkedId: primaryContact.id,
          updatedAt: new Date(),
        },
      });
      return next();
    }

    //checking if we need to create a new secondary contact
    //checks if the email and phone is there in db
    const emailFlag = email
      ? contactExists.some((ele) => ele.email === email)
      : true;
    const phoneNumberFlag = phoneNumber
      ? contactExists.some((ele) => ele.phoneNumber === phoneNumber)
      : true;

    //if either of them are missing we consider it as a new entry and create a new secondary contact
    if (!emailFlag || !phoneNumberFlag) {
      await prisma.contact.create({
        data: {
          email: email ? email : null,
          phoneNumber: phoneNumber ? phoneNumber : null,
          linkedId: primaryContactId,
          linkPrecedence: "secondary",
          createdAt: new Date(),
          updatedAt: null,
          deleteAt: null,
        },
      });
    }
    return next();
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = { contactHandler, getContact };
