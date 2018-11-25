const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./ckstats.sqlite');
 
client.on("ready", () => {
  // Table for CUBS
  const tablec = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scoresc';").get();
  if (!tablec['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE scoresc (id TEXT PRIMARY KEY, user TEXT, guild TEXT, avl INTEGER, heal INTEGER, avheal INTEGER);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scoresc_id ON scoresc (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }
	// And then we have two prepared statements to get and set the score data.
  client.getScorec = sql.prepare("SELECT * FROM scoresc WHERE user = ? AND guild = ?");
  client.setScorec = sql.prepare("INSERT OR REPLACE INTO scoresc (id, user, guild, avl, heal, avheal) VALUES (@id, @user, @guild, @avl, @heal, @avheal);");
  client.delScorec = sql.prepare("DELETE FROM scoresc WHERE user = ? AND guild = ?");
  
  // Table for Wrekers
    const tablew = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'scoresw';").get();
  if (!tablew['count(*)']) {
    // If the table isn't there, create it and setup the database correctly.
    sql.prepare("CREATE TABLE scoresw (id TEXT PRIMARY KEY, user TEXT, guild TEXT, avl INTEGER, heal INTEGER, avheal INTEGER);").run();
    // Ensure that the "id" row is always unique and indexed.
    sql.prepare("CREATE UNIQUE INDEX idx_scoresw_id ON scoresw (id);").run();
    sql.pragma("synchronous = 1");
    sql.pragma("journal_mode = wal");
  }
	// And then we have two prepared statements to get and set the score data.
  client.getScorew = sql.prepare("SELECT * FROM scoresw WHERE user = ? AND guild = ?");
  client.setScorew = sql.prepare("INSERT OR REPLACE INTO scoresw (id, user, guild, avl, heal, avheal) VALUES (@id, @user, @guild, @avl, @heal, @avheal);");
  client.delScorew = sql.prepare("DELETE FROM scoresc WHERE user = ? AND guild = ?");
  //client.resetscorew = sql.prepare("INSERT OR REPLACE INTO scoresw (avl, heal, avheal) VALUES (3, 0, 2);");
  
  console.log("I am ready!");
});


client.on("message", message => {
  //Verifying for a bot and prefix
   if (message.author.bot) return;
   
    let scorec;
	let scorew;
 
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
	

	
	if(command === "ustats") {
   
 let crole = message.guild.roles.find(role => role.name === "cubs");
 let wrole = message.guild.roles.find(role => role.name === "wreckers");
 let vrole = message.member.roles.has(crole.id) || message.member.roles.has(wrole.id)
//  let uavl = parseInt(args[0]);
//  let uheal = parseInt(args[1]);
//  let uavheal = parseInt(args[2]);

	if(!vrole) return message.channel.send("You dont have a valid role");
	
	if(message.member.roles.has(crole.id)) {
	
	// Get their current points.
	let scorec = client.getScorec.get(message.author.id, message.guild.id);
	// It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
	if (!scorec) {
    scorec = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, avl: 3, heal: 0, avheal: 2 }
	}
	
    let uavl = parseInt(args[0]);
	let uheal = parseInt(args[1]);
	let uavheal = parseInt(args[2]);
	
  scorec.avl = uavl;
  scorec.heal = uheal;
  scorec.avheal = uavheal;
  
  client.setScorec.run(scorec);
  
  return message.channel.send(` \n Cub, your stats has been updated \n Available cars ${scorec.avl} | Healing ${scorec.heal} | Heals Reamaning ${scorec.avheal}.`);
}
  
	//Command for Wrekers
	
	if(message.member.roles.has(wrole.id)) {
  
 
  // Get their current points.
  let scorew = client.getScorew.get(message.author.id, message.guild.id);
  // It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
  if (!scorew) {
    scorew = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, avl: 3, heal: 0, avheal: 2 }
  }
    
	let uavl = parseInt(args[0]);
	let uheal = parseInt(args[1]);
	let uavheal = parseInt(args[2]);
	
  scorew.avl = uavl;
  scorew.heal = uheal;
  scorew.avheal = uavheal;
  
  client.setScorew.run(scorew);
  
  return message.channel.send(` \n Wrecker, your stats has been updated \n Available cars ${scorew.avl} | Healing ${scorew.heal} | Heals Reamaning ${scorew.avheal}.`);
	}
	
}
	
 if(command === "viewwer") {
  const wstats = sql.prepare("SELECT * FROM scoresw WHERE guild = ?").all(message.guild.id);
 
    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.RichEmbed()
    .setTitle("City Kings Statistics - Wreckers")
    .setColor(0x00AE86);
 
  for(const data of wstats) {
    embed.addField(client.users.get(data.user).tag, `A -   ${data.avl} | H -   ${data.heal} | HR -   ${data.avheal}`);
  }
     
  return message.channel.send({embed});
  
 }
 
 if(command === "viewcub") {
  const cstats = sql.prepare("SELECT * FROM scoresc WHERE guild = ?").all(message.guild.id);
 
    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.RichEmbed()
    .setTitle("City Kings Statistics - CUBS")
    .setColor(0x00AE86);
 
  for(const data of cstats) {
    embed.addField(client.users.get(data.user).tag, `A -   ${data.avl} | H -   ${data.heal} | HR -   ${data.avheal}`);
  }
  
  return message.channel.send({embed});
  
 }
  
 if(command === "viewall") {
  const cstats = sql.prepare("SELECT * FROM scoresc WHERE guild = ?").all(message.guild.id);
  const wstats = sql.prepare("SELECT * FROM scoresw WHERE guild = ?").all(message.guild.id);
 
    // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.RichEmbed()
    .setTitle("City Kings Statistics")
    .setColor(0x00AE86);
 
  for(const data of wstats) {
    embed.addField(client.users.get(data.user).tag, ` Wrecker | A -   ${data.avl} | H -   ${data.heal} | HR -   ${data.avheal}`);
  }
   
  for(const data of cstats) {
    embed.addField(client.users.get(data.user).tag, `CUB | A -   ${data.avl} | H -   ${data.heal} | HR -   ${data.avheal}`);
  }
  
  return message.channel.send({embed});
  
 }
 
 /*if(command === "del") {
	 
	 let crole = message.guild.roles.get('515877966358642738');
	 let wrole = message.guild.roles.get('515877925258788874');
	 
	 const user = message.mentions.users.first() || client.users.get(args[0]);
	 if(!user) return message.channel.send("You must mention the gang member tobe removed after the command");
	 
	 if(message.member.roles.has(crole.id)) {
	
	// Get their current points.
	let dscorec = client.getScorec.get(message.author.id, message.guild.id);
	
	if (!dscorec) {
    return message.channel.send(`CUB dont exits in the CK stats`);
	}
  
    client.delScorec.run(dscorec);
	return message.channel.send(`Gang member has been deleted from CK stats`);
 }
	if(message.member.roles.has(wrole.id)) {
	
	// Get their current points.
	let dscorew = client.getScorew.get(message.author.id, message.guild.id);
	// It's possible to give points to a user we haven't seen, so we need to initiate defaults here too!
	if (!dscorew) {
    return message.channel.send(`Wrecker dont exits in the CK stats`);
	}
  
    client.delScorew.run(dscorew);
	return message.channel.send(`Gang member has been deleted from CK stats`);
 }
 }*/
	if (command === "help") return message.channel.send("use prefix f! for every command \n \n **ustats** <avl-cars> <Cars-Healing> <Heals-Remaning> - To upadte your stats \n \n **viewcub** - Toview the statiscs of CUBS \n \n **viewwer** - To view wreckers statistics \n \n **viewall** - Toview complete gang statiscs");
});
 
client.login(config.token);