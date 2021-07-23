const { MessageEmbed } = require("discord.js");
const { readdirSync } = require("fs");
const { idRolMentor, idRolStaff, idRolMesa2021 } = require("../..");

module.exports = {
  name: "help",
  aliases : ['h'],
  description: "Shows all available bot commands.",
  example: "?help",
  async execute (client, message, cmd, args, Discord) {

    let mentorRole = message.member.roles.cache.find(r => r.id === idRolMentor);
    let staffRole = message.member.roles.cache.find(r => r.id === idRolStaff);
    let adminRole = message.member.roles.cache.find(r => r.id === idRolMesa2021);

    const roleColor =
      message.guild.me.displayHexColor === "#000000"
        ? "#ffffff"
        : message.guild.me.displayHexColor;

    if (!args[0]) {
      let categories = [];
      const mentorCategories = ["mentor"];
      const adminCategories = ["admin"];

      readdirSync("./commands/").forEach((direct) => {
        if(mentorCategories.includes(direct) && !mentorRole) return;
        if(adminCategories.includes(direct) && (!adminRole && !staffRole)) return;
        const commands = readdirSync(`./commands/${direct}/`).filter((file) =>
          file.endsWith(".js")
        );


        const cmds = commands.map((command) => {
          let file = require(`../../commands/${direct}/${command}`);

          if (!file.name) return "No existe el comando.";

          let name = file.name.replace(".js", "");


          return `\`${name}\``;
        });

        let data = new Object();

        data = {
          name: direct.toUpperCase(),
          value: cmds.length === 0 ? "En progreso..." : cmds.join(" "),
        };

        categories.push(data);
      });

      const embed = new MessageEmbed()
        .setAuthor(client.user.username, client.user.displayAvatarURL({ dynamic: true }))
        .setTitle('Lista de comandos de HackMTY '/* + '<:hackmty:862511447682973756>'*/)
        .setThumbnail(client.user.avatarURL({ dynamic:true }))
        .addFields(categories)
        .setDescription(
          `Usa \`${prefix}help\` seguido del nombre del comando para obtener mas informacion de este. Por ejemplo: \`${prefix}help mentorlist\`.`
        )
        .setFooter(
          `Solicitado por ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setTimestamp()
        .setColor(roleColor);
      return message.channel.send(embed);
    } else {
      const command =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.find(
          (c) => c.aliases && c.aliases.includes(args[0].toLowerCase())
        );

      if (!command) {
        const embed = new MessageEmbed()
          .setTitle(`Comando Invalido! Usa \`${prefix}help\` para ver todos los comandos!`)
          .setColor("FF0000");
        return message.channel.send(embed);
      }

      const embed = new MessageEmbed()
        .setTitle("Detalles de Comando:")
        .addField("PREFIJO:", `\`${prefix}\``)
        .addField(
          "COMANDO:",
          command.name ? `\`${command.name}\`` : "No existe este nombre de comando."
        )
        .addField(
          "ALIASES:",
          command.aliases
            ? `\`${command.aliases.join("` `")}\``
            : "No existe este alias de este comando."
        )
        .addField(
          "DESCRIPCION:",
          command.description
            ? command.description
            : "No existe descripcion de este comando."
        )
        .addField(
          "EJEMPLO:",
          command.example
            ? command.example
            : "No existe ejemplo de este comando."
        )
        .setFooter(
          `Solicitado por ${message.author.tag}`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setTimestamp()
        .setColor(roleColor);
      return message.channel.send(embed);
    }
  },
};