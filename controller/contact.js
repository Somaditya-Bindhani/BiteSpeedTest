const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getContact = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
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
    const allContacts = await prisma.contact.findMany({
      where: {
        OR: filter,
      },
    });
    let primaryContact = allContacts.length
      ? allContacts.find((ele) => ele.linkPrecedence === "primary")
      : null;
    if (!primaryContact) {
      const data = await prisma.contact.findUnique({
        where: {
          id: allContacts[0].linkedId,
        },
      });
      allContacts.unshift(data);
      primaryContact = data;
    }
    const response = {
      primaryContactId: primaryContact.id,
      emails: allContacts.map((ele) => ele.email),
      phoneNumbers: allContacts.map((ele) => ele.phoneNumber),
      secondaryContactId: allContacts.map((ele) => {
        if (ele.linkPrecedence !== "primary") return ele.id;
      }),
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
      return next();
    }
    const primaryContactArray = contactExists.filter(
      (ele) => ele.linkPrecedence === "primary"
    );
    const primaryContact = primaryContactArray[0] || null;
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
      const id = primaryContact ? primaryContact.id : contactExists[0].linkedId;
      const data = await prisma.contact.create({
        data: {
          email: email ? email : null,
          phoneNumber: phoneNumber ? phoneNumber : null,
          linkedId: id,
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
