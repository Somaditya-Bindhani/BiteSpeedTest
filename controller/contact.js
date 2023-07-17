const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const contactHandler = async (req, res) => {
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
          linkPrecedence: "primary",
          email,
        },
      ];
    }
    if (phoneNumber) {
      filter = [
        ...filter,
        {
          linkPrecedence: "primary",
          phoneNumber,
        },
      ];
    }
    const primaryContactArray = await prisma.contact.findMany({
      where: {
        OR: filter,
      },
      orderBy: { createdAt: "asc" },
    });
    if (!primaryContactArray.length) {
      const data = await prisma.contact.create({
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
      return res.status(200).json({ content: data });
    }
    const primaryContact = primaryContactArray[0];
    if (
      (email && primaryContact.email !== email) ||
      (phoneNumber && primaryContact.phoneNumber !== phoneNumber)
    ) {
      const data = await prisma.contact.create({
        data: {
          email: email ? email : null,
          phoneNumber: phoneNumber ? phoneNumber : null,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
          createdAt: new Date(),
          updatedAt: null,
          deleteAt: null,
        },
      });
      return res.status(200).json({ content: { primaryContactArray, data } });
    }
    return res.status(200).json("OK");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal Server Error");
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = contactHandler;
