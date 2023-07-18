const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getContact = async (req, res) => {
  try {
    const id = req.primaryContactId;
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
    console.log(emails, phoneNumbers);
    const response = {
      primaryContactId: primaryContact.id,
      emails: [...emails],
      phoneNumbers: [...phoneNumbers],
      secondaryContactId,
    };
    return res.status(500).json(response);
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
    const contactExists = await prisma.contact.findMany({
      where: {
        OR: filter,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
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
    const primaryContactArray = contactExists.filter(
      (ele) => ele.linkPrecedence === "primary"
    );
    const primaryContact = primaryContactArray[0] || null;
    const primaryContactId = primaryContact
      ? primaryContact.id
      : contactExists[0].linkedId;
    req.primaryContactId = primaryContactId;
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
    const emailFlag = email
      ? contactExists.some((ele) => ele.email === email)
      : true;
    const phoneNumberFlag = phoneNumber
      ? contactExists.some((ele) => ele.phoneNumber === phoneNumber)
      : true;
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
